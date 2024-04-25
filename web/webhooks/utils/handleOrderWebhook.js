import * as Sentry from '@sentry/node';
import { getClient } from '../../database/connect.js';
import { addOrdersWebhookToDB } from './addOrdersWebhookToDB.js';
import { throwError } from '../../utils/index.js';
import { handleStockAfterOrderUpdate } from './handleStockAfterOrderUpdate.js';
// TODO move this to utils
import { updateCurrentVariantInventory } from '../updateCurrentVariantInventory.js';
import { sendOrderToProducerAndUpdateSalesSessionOrderId } from './sendOrderToProducerAndUpdateSalesSessionOrderId.js';
import { updateVariantExcessItems } from './updateVariantExcessItems.js';
import { createHubCustomerDetails } from '../../utils/createHubCustomerDetails.js';
import {
  addSalesSessionsOrder,
  updateSalesSessionsOrdersStatus
} from './addUpdateSalesSessionsOrders.js';

const orderStatuses = {
  PENDING: 'pending',
  PRODUCER_CONFIRMED: 'producer_confirmed',
  PRODUCER_REJECTED: 'producer_rejected',
  INTERNAL_CONFIRMATION: 'internal_confirmation',
  PART_INTERNAL_PART_PRODUCER_CONFIRMATION:
    'part_internal_part_producer_confirmation'
};

const updateExcessItemsAndInventory = async (variantData, sqlClient) => {
  const updateExcessItemsPromises = variantData.map(
    async ({
      hubVariantId,
      noOfItemsPerPackage,
      mappedProducerVariantId,
      numberOfExcessItems,
      hubProductId,
      producerProductId
    }) => {
      await updateVariantExcessItems({
        numberOfExcessItems,
        hubVariantId,
        sqlClient
      });
      await updateCurrentVariantInventory({
        storedHubVariant: {
          hubVariantId,
          noOfItemsPerPackage,
          mappedVariantId: mappedProducerVariantId,
          // TODO rename this to numberOfExcessItems
          numberOfExcessOrders: numberOfExcessItems
        },
        hubProductId,
        producerProductId
      });
    }
  );

  return Promise.allSettled(updateExcessItemsPromises);
};

export const handleOrderWebhook = async ({
  topic,
  shop,
  webhookId,
  orderType,
  payload,
  activeSalesSessions,
  variantsFromPayload,
  variantsFromDB
}) => {
  const sqlClient = await getClient();
  try {
    const orderNumber = payload?.order_number;

    await addOrdersWebhookToDB(webhookId, topic, payload, sqlClient);

    console.log(
      `handleOrderWebhook: added webhook with id ${webhookId} to db for order number ${orderNumber}`
    );

    const activeSalesSessionOrderId = activeSalesSessions?.[0].orderId;
    const activeSalesSessionId = activeSalesSessions?.[0].id;
    const { salesSessionsOrderId } = await addSalesSessionsOrder({
      salesSessionId: activeSalesSessionId,
      webhookId,
      orderNumber,
      orderType,
      orderStatus: orderStatuses.PENDING,
      sqlClient
    });

    const handleStockAfterOrderUpdatePromises = await Promise.allSettled(
      variantsFromPayload.map(async (v) => {
        const singleVariantFromDB = variantsFromDB.find(
          (ev) => Number(ev.hubVariantId) === Number(v.variantId)
        );

        return handleStockAfterOrderUpdate({
          orderType,
          variantFromOrder: v,
          variantFromDB: singleVariantFromDB
        });
      })
    );

    const updatedVariantsData = handleStockAfterOrderUpdatePromises
      .filter((p) => p.status === 'fulfilled')
      .map((p) => p.value);

    if (updatedVariantsData?.length === 0) {
      console.log(
        ` handleOrderWebhook: No variants data found for sales session: ${activeSalesSessionId}`
      );
      return {
        statusCode: 200
      };
    }
    // update the excess items for variants that were not sent to producer
    const variantsWithSufficientExcessItems = updatedVariantsData.filter(
      (v) => Number(v?.numberOfPackages) < 1
    );

    if (variantsWithSufficientExcessItems?.length > 0) {
      await updateExcessItemsAndInventory(
        variantsWithSufficientExcessItems,
        sqlClient
      );
    }

    const variantsToOrderFromProducer = updatedVariantsData.filter(
      (v) => Number(v?.numberOfPackages) > 0
    );

    if (variantsToOrderFromProducer.length === 0) {
      await updateSalesSessionsOrdersStatus({
        salesSessionsOrderId,
        status: orderStatuses.INTERNAL_CONFIRMATION,
        sqlClient
      });

      console.log(
        `handleOrderWebhook: No line items to be sent to producer for sales session: ${activeSalesSessionId}`
      );
      return {
        statusCode: 200
      };
    }

    const customer = createHubCustomerDetails(shop, {});
    // trigger the order to producer
    const { producerRespondSuccess, newProducerOrderId } =
      await sendOrderToProducerAndUpdateSalesSessionOrderId({
        activeSalesSessionOrderId,
        variants: variantsToOrderFromProducer,
        activeSalesSessionId,
        customer,
        orderType,
        sqlClient
      });

    if (!producerRespondSuccess || !newProducerOrderId) {
      await updateSalesSessionsOrdersStatus({
        salesSessionsOrderId,
        status: orderStatuses.PRODUCER_REJECTED,
        sqlClient
      });
      throwError(
        'handleOrderWebhook: Error occurred while sending the order to producer'
      );
    }
    console.log(
      `handleOrderWebhook: Updated sales session with order id ${newProducerOrderId} as received from producer`
    );

    await updateExcessItemsAndInventory(variantsToOrderFromProducer, sqlClient);

    console.log(
      'handleOrderWebhook: Updated inventory for variants, all done!'
    );

    await updateSalesSessionsOrdersStatus({
      salesSessionsOrderId,
      status:
        variantsWithSufficientExcessItems?.length > 0
          ? orderStatuses.PART_INTERNAL_PART_PRODUCER_CONFIRMATION
          : orderStatuses.PRODUCER_CONFIRMED,
      sqlClient
    });

    return {
      statusCode: 200
    };
  } catch (err) {
    console.error(
      'handleOrderWebhook: Error occurred while processing the request',
      err
    );
    Sentry.captureException(err);
    return {
      statusCode: 500
    };
  } finally {
    sqlClient.release();
  }
};
