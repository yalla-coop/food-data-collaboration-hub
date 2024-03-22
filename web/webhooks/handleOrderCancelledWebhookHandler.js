/* eslint-disable no-restricted-syntax */
import { DeliveryMethod } from '@shopify/shopify-api';
import * as Sentry from '@sentry/node';
import axios from 'axios';
import dotenv from 'dotenv';
import { getClient, query } from '../database/connect.js';
import { updateCurrentVariantInventory } from './updateCurrentVariantInventory.js';
import { calculateTheExcessOrders } from './calculateTheExcessOrders.js';

import exportDFCConnectorOrder, {
  exportDFCConnectorCustomer
} from '../connector/orderUtils.js';
import { throwError } from '../utils/index.js';

dotenv.config();

const { PRODUCER_SHOP_URL, PRODUCER_SHOP } = process.env;

const sendOrderToProducer = async ({
  activeSalesSessionOrderId,
  variants = [],
  customer
}) => {
  const lineItems = variants.map((variant) => ({
    variant_id: Number(variant.mappedProducerVariantId),
    quantity: variant.numberOfPackages
  }));

  const shopifyOrder = {
    id: activeSalesSessionOrderId,
    lineItems,
    customer
  };

  const exportedOrder = await exportDFCConnectorOrder(shopifyOrder);

  const exportedCustomer = await exportDFCConnectorCustomer(shopifyOrder);

  console.log('object :>> ', {
    userId: '123',
    accessToken: 'access-token',
    orderId: activeSalesSessionOrderId,
    exportedOrder,
    exportedCustomer
  });

  // try {
  //   const { data } = await axios.patch(
  //     `${PRODUCER_SHOP_URL}fdc/orders/cancel/${activeSalesSessionOrderId}?shop=${PRODUCER_SHOP}`,
  //     {
  //       userId: '123',
  //       accessToken: 'access-token',
  //       orderId: activeSalesSessionOrderId,
  //       exportedOrder,
  //       exportedCustomer
  //     },
  //     {
  //       headers: {
  //         'Content-Type': 'application/json'
  //       }
  //     }
  //   );
  //   return data.order.id;
  // } catch (err) {
  //   throwError(
  //     'sendOrderToProducer: Error occurred while sending the order to producer',
  //     err
  //   );
  // }
};

const handleSendOrderToProducerAndUpdateSalesSessionOrderId = async ({
  activeSalesSessionOrderId,
  variants,
  activeSalesSessionId,
  customer
}) => {
  const newProducerOrderId = await sendOrderToProducer({
    activeSalesSessionOrderId,
    variants,
    customer
  });

  const updateSalesSessionQuery = `
      UPDATE sales_sessions
      SET order_id = $1
      WHERE id = $2
      `;
  await query(updateSalesSessionQuery, [
    newProducerOrderId,
    activeSalesSessionId
  ]);
};

export const exportFinalVariantDataAndUpdateDB = async ({
  singleLineItemFromOrder,
  // activeSalesSessionResult,
  verifiedVariantFromOrder
}) => {
  if (!singleLineItemFromOrder) {
    throwError('SingleLineItemFromOrder not found');
  }

  if (!singleLineItemFromOrder.variantId || !singleLineItemFromOrder.quantity) {
    throwError(
      'singleLineItemFromOrder attributes missing (variantId, quantity)'
    );
  }

  const { variantId: hubVariantId, quantity } = singleLineItemFromOrder;

  const { hubProductId, producerProductId } = verifiedVariantFromOrder;
  const mappedProducerVariantId = verifiedVariantFromOrder?.mappedVariantId;

  if (!hubProductId || !producerProductId || !mappedProducerVariantId) {
    throwError(
      'exportFinalVariantDataAndUpdateDB: hubProductId, producerProductId or mappedProducerVariantId not found'
    );
  }

  const noOfItemsPerPackage = Number(
    verifiedVariantFromOrder.noOfItemsPerPackage
  );

  const numberOfExcessItemsFromDB = Number(
    verifiedVariantFromOrder.numberOfExcessOrders
  );

  // TODO make this subtract the number of items from the order
  const excessItemsData = calculateTheExcessOrders({
    noOfItemsPerPackage,
    quantity,
    numberOfExitingExcessOrders: numberOfExcessItemsFromDB
  });

  const numberOfPackages = excessItemsData?.numberOfPackages;

  const numberOfExcessItems = excessItemsData?.numberOfExcessOrders || 0;

  const updateVariantQuery = `
      UPDATE variants
      SET number_of_excess_orders = $1
      WHERE hub_variant_id = $2
  `;

  await query(updateVariantQuery, [numberOfExcessItems, hubVariantId]);

  return {
    noOfItemsPerPackage,
    numberOfPackages,
    numberOfExcessOrders: numberOfExcessItems,
    mappedProducerVariantId,
    hubVariantId,
    hubProductId,
    producerProductId
  };
};

export const handleOrderCancelledWebhook = async (
  topic,
  shop,
  body,
  webhookId
) => {
  try {
    const sqlClient = await getClient();
    try {
      const selectWebhookQuery = `
          SELECT
          *
          FROM webhooks
          WHERE id = $1
          `;
      const result = await query(selectWebhookQuery, [webhookId]);
      if (result.rows.length > 0) {
        return {
          statusCode: 200
        };
      }
      const payload = JSON.parse(body);

      await sqlClient.query('BEGIN');
      const insertWebhookQuery = `
            INSERT INTO webhooks (id,topic,data)
            VALUES ($1,$2,$3)
    `;
      await query(insertWebhookQuery, [webhookId, topic, payload], sqlClient);
      await sqlClient.query('COMMIT');
      if (!payload?.line_items?.length) {
        throwError(
          'handleOrderCancelledWebhookHandler: No line items found in the payload'
        );
      }
      const lineItemsFromOrder = payload.line_items.map((lineItem) => ({
        variantId: lineItem.variant_id,
        quantity: Number(lineItem.quantity)
      }));

      const selectActiveSalesSessionQuery = `
          SELECT
            *
          FROM sales_sessions
          WHERE is_active = true
    `;

      const activeSalesSessionResult = await query(
        selectActiveSalesSessionQuery,
        []
      );

      if (activeSalesSessionResult.rows.length === 0) {
        throwError(
          'handleOrderCancelledWebhookHandler: No active sales session found'
        );
      }

      const activeSalesSessionOrderId =
        activeSalesSessionResult.rows[0].orderId;

      const activeSalesSessionId = activeSalesSessionResult.rows[0].id;

      const selectVariantsFromDBQuery = `
        SELECT
          v.*,
          p.producer_product_id,
          p.hub_product_id
        FROM variants as v
        INNER JOIN products as p
        ON v.product_id = p.id
        WHERE hub_variant_id = ANY($1)
  `;

      const matchedVariantsFromDB = await query(selectVariantsFromDBQuery, [
        lineItemsFromOrder.map(
          (singleLineItemFromOrder) => singleLineItemFromOrder.variantId
        )
      ]);

      if (matchedVariantsFromDB?.rows?.length === 0) {
        throwError(
          'handleOrderCancelledWebhookHandler: No variants found in DB that matched the order'
        );
      }

      const exportFinalVariantDataAndUpdateDBPromises =
        await Promise.allSettled(
          lineItemsFromOrder.map(async (singleLineItemFromOrder) => {
            const verifiedVariantFromOrder = matchedVariantsFromDB.rows.find(
              (singleMatchedVariantFromDB) =>
                Number(singleMatchedVariantFromDB.hubVariantId) ===
                Number(singleLineItemFromOrder.variantId)
            );

            return exportFinalVariantDataAndUpdateDB({
              singleLineItemFromOrder,
              activeSalesSessionResult,
              verifiedVariantFromOrder
            });
          })
        );

      const finalVariantsData = exportFinalVariantDataAndUpdateDBPromises
        .filter((p) => p.status === 'fulfilled')
        .map((p) => p.value);

      if (finalVariantsData.length === 0) {
        return {
          statusCode: 200
        };
      }

      const finalVariantsDataWithPackages = finalVariantsData.filter(
        (v) => v.numberOfPackages > 0
      );

      const variantsLineItemsToSendToProducer =
        finalVariantsDataWithPackages.map((v) => ({
          mappedProducerVariantId: v.mappedProducerVariantId,
          numberOfPackages: v.numberOfPackages
        }));

      const customer = {
        first_name: shop.split('.myshopify')[0],
        last_name: '',
        email: `${shop.split('.myshopify')[0]}@yallacooperative.com`
      };

      await handleSendOrderToProducerAndUpdateSalesSessionOrderId({
        activeSalesSessionOrderId,
        variants: variantsLineItemsToSendToProducer,
        activeSalesSessionId,
        customer
      });

      const updateVariantsInventoryPromises = finalVariantsDataWithPackages.map(
        async ({
          hubVariantId,
          noOfItemsPerPackage,
          mappedProducerVariantId,
          numberOfExcessOrders,
          hubProductId,
          producerProductId
        }) =>
          // TODO: set this to subtract the number of items from the order
          updateCurrentVariantInventory({
            storedHubVariant: {
              hubVariantId,
              noOfItemsPerPackage,
              mappedVariantId: mappedProducerVariantId,
              numberOfExcessOrders
            },
            hubProductId,
            producerProductId
          })
      );

      await Promise.allSettled(updateVariantsInventoryPromises);

      return {
        statusCode: 200
      };
    } catch (err) {
      await sqlClient.query('ROLLBACK');
      throwError(
        'handleOrderCancelledWebhookHandler: Error occurred while processing the query',
        err
      );
    } finally {
      sqlClient.release();
    }
  } catch (err) {
    throwError(
      'handleOrderCancelledWebhookHandler: Error occurred while processing the request',
      err
    );
    Sentry.captureException(err);
    return {
      statusCode: 500
    };
  }
};

const handleOrderCancelledWebhookCallback = async (
  topic,
  shop,
  body,
  webhookId
) => {
  // without awaiting
  handleOrderCancelledWebhook(topic, shop, body, webhookId);
  return {
    statusCode: 200
  };
};

const handleOrderCancelledWebhookHandler = {
  ORDERS_CANCELLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/api/webhooks',
    callback: handleOrderCancelledWebhookCallback
  }
};

export default handleOrderCancelledWebhookHandler;
