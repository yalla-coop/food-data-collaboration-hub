import * as Sentry from '@sentry/node';
import { getClient, query } from '../../database/connect.js';
import { addOrdersWebhookToDBAndReturnVariants } from './addOrdersWebhookToDBAndReturnVariants.js';
import { getActiveSalesSessionDetails } from './getActiveSalesSessionDetails.js';
import { throwError } from '../../utils/index.js';
import { handleStockAfterOrderUpdate } from './handleStockAfterOrderUpdate.js';
// TODO move this to utils
import { updateCurrentVariantInventory } from '../updateCurrentVariantInventory.js';
import { handleSendOrderToProducerAndUpdateSalesSessionOrderId } from './ handleSendOrderToProducerAndUpdateSalesSessionOrderId.js';

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

export const handleOrderWebhook = async (
  topic,
  shop,
  body,
  webhookId,
  orderType
) => {
  const sqlClient = await getClient();
  try {
    const { variants } = await addOrdersWebhookToDBAndReturnVariants(
      webhookId,
      topic,
      body,
      sqlClient
    );

    console.log(`handleOrderWebhook: added webhook with id ${webhookId} to db`);

    const { activeSalesSessionOrderId, activeSalesSessionId } =
      await getActiveSalesSessionDetails(sqlClient);

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
          variantFromDB: singleVariantFromDB,
          sqlClient
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

    const wholeSaleVariantsToOrderFromProducer = updatedVariantsData
      .filter((v) => v.numberOfPackages > 0)
      .map((v) => ({
        mappedProducerVariantId: v.mappedProducerVariantId,
        numberOfPackages: v.numberOfPackages
      }));

    if (wholeSaleVariantsToOrderFromProducer.length === 0) {
      console.log(
        `handleOrderWebhook: No line items to be sent to producer for sales session: ${activeSalesSessionId}`
      );
      return {
        statusCode: 200
      };
    }

    const customer = {
      first_name: shop.split('.myshopify')[0],
      last_name: '',
      email: `${shop.split('.myshopify')[0]}@yallacooperative.com`
    };

    // trigger the order to producer
    const { producerRespondSuccess, newProducerOrderId } =
      await handleSendOrderToProducerAndUpdateSalesSessionOrderId({
        activeSalesSessionOrderId,
        variants: wholeSaleVariantsToOrderFromProducer,
        activeSalesSessionId,
        customer,
        orderType,
        sqlClient
      });

    if (!producerRespondSuccess) {
      throwError(
        'handleOrderWebhook: Error occurred while sending the order to producer'
      );
    }
    console.log(
      `handleOrderWebhook: Updated sales session with order id ${newProducerOrderId} as received from producer`
    );

    // TODO add sqlClient to updateCurrentVariantInventory
    const updateVariantsInventoryPromises = updatedVariantsData
      .filter((v) => v.numberOfPackages > 0)
      .map(
        async ({
          hubVariantId,
          noOfItemsPerPackage,
          mappedProducerVariantId,
          numberOfExcessItems,
          hubProductId,
          producerProductId
        }) =>
          updateCurrentVariantInventory({
            storedHubVariant: {
              hubVariantId,
              noOfItemsPerPackage,
              mappedVariantId: mappedProducerVariantId,
              // TODO rename this to numberOfExcessItems
              numberOfExcessOrders: numberOfExcessItems
            },
            hubProductId,
            producerProductId
          })
      );

    await Promise.allSettled(updateVariantsInventoryPromises);
    console.log(
      'handleOrderWebhook: Updated inventory for variants, all done!'
    );
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
