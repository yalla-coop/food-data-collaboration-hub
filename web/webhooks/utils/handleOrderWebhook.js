import * as Sentry from '@sentry/node';
import { getClient, query } from '../../database/connect.js';
import { addOrdersWebhookToDBAndReturnVariants } from './addOrdersWebhookToDBAndReturnVariants.js';
import { getActiveSalesSessionDetails } from './getActiveSalesSessionDetails.js';
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

const selectVariantsQuery = `
SELECT
  v.*,
  p.producer_product_id,
  p.hub_product_id
FROM variants as v
INNER JOIN products as p
ON v.product_id = p.id
WHERE hub_variant_id = ANY($1)
`;

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

export const handleOrderWebhook = async (
  topic,
  shop,
  body,
  webhookId,
  orderType
) => {
  const sqlClient = await getClient();
  try {
    const { variants, orderNumber } =
      await addOrdersWebhookToDBAndReturnVariants(
        webhookId,
        topic,
        body,
        sqlClient
      );

    console.log(
      `handleOrderWebhook: added webhook with id ${webhookId} to db for order number ${orderNumber}`
    );

    const { activeSalesSessionOrderId, activeSalesSessionId } =
      await getActiveSalesSessionDetails(sqlClient);

    const { salesSessionsOrderId } = await addSalesSessionsOrder({
      salesSessionId: activeSalesSessionId,
      webhookId,
      orderNumber,
      orderType,
      orderStatus: orderStatuses.PENDING,
      sqlClient
    });

    const variantFromDB = await query(
      selectVariantsQuery,
      [variants.map((v) => v.variantId)],
      sqlClient
    );

    if (variantFromDB?.rows?.length === 0) {
      throwError(
        'handleOrderPaidWebhookHandler: No matching variants found in DB'
      );
    }

    const handleStockAfterOrderUpdatePromises = await Promise.allSettled(
      variants.map(async (v) => {
        const singleVariantFromDB = variantFromDB.rows.find(
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
