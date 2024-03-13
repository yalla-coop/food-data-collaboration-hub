/* eslint-disable no-restricted-syntax */
import { DeliveryMethod } from '@shopify/shopify-api';
import * as Sentry from '@sentry/node';
import axios from 'axios';
import dotenv from 'dotenv';
import { getClient, query } from '../database/connect.js';
import { updateCurrentVariantInventory } from './updateCurrentVariantInventory.js';
import { calculateTheExcessOrders } from './calculateTheExcessOrders.js';
import { calculateTheRemainingOrders } from './calculateTheRemainingOrders.js';
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

  try {
    const { data } = await axios.patch(
      `${PRODUCER_SHOP_URL}fdc/orders/${activeSalesSessionOrderId}?shop=${PRODUCER_SHOP}`,
      {
        userId: '123',
        accessToken: 'access-token',
        orderId: activeSalesSessionOrderId,
        exportedOrder,
        exportedCustomer
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return data.order.id;
  } catch (err) {
    throwError(
      'sendOrderToProducer: Error occurred while sending the order to producer',
      err
    );
  }
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

export const handleVariantItemsCount = async ({
  v,
  activeSalesSessionResult,
  exitingVariant
}) => {
  if (!v) {
    throw new Error('Variant not found');
  }

  if (!v.variantId || !v.quantity) {
    throw new Error('Variant not found');
  }

  const { variantId: hubVariantId, quantity } = v;

  const { hubProductId, producerProductId } = exitingVariant;
  const mappedProducerVariantId = exitingVariant.mappedVariantId;
  const noOfItemsPerPackage = Number(exitingVariant.noOfItemsPerPackage);
  const numberOfExitingExcessOrders = Number(
    exitingVariant.numberOfExcessOrders
  );
  const numberOfExitingRemainingOrders = Number(
    exitingVariant.numberOfRemainingOrders
  );

  const isPartiallySoldCasesEnabled =
    activeSalesSessionResult.rows[0].partiallySoldEnabled;

  let remainingOrdersData = {};
  let excessOrdersData = {};

  if (isPartiallySoldCasesEnabled) {
    excessOrdersData = calculateTheExcessOrders({
      noOfItemsPerPackage,
      quantity,
      numberOfExitingExcessOrders
    });
  } else {
    remainingOrdersData = calculateTheRemainingOrders({
      numberOfExitingRemainingOrders,
      noOfItemsPerPackage,
      quantity
    });
  }

  const numberOfPackages = isPartiallySoldCasesEnabled
    ? excessOrdersData.numberOfPackages
    : remainingOrdersData.numberOfPackages;

  const numberOfExcessOrders = excessOrdersData?.numberOfExcessOrders || 0;
  const numberOfRemainingOrders =
    remainingOrdersData?.numberOfRemainingOrders || 0;

  const updateVariantQuery = `
      UPDATE variants
      SET number_of_excess_orders = $1,
      number_of_remaining_orders = $2
      WHERE hub_variant_id = $3
  `;

  await query(updateVariantQuery, [
    numberOfExcessOrders,
    numberOfRemainingOrders,
    hubVariantId
  ]);

  return {
    noOfItemsPerPackage,
    numberOfPackages,
    numberOfExcessOrders,
    numberOfRemainingOrders,
    mappedProducerVariantId,
    hubVariantId,
    hubProductId,
    producerProductId
  };
};

export const handleOrderPaidWebhook = async (topic, shop, body, webhookId) => {
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
          'handleOrderPaidWebhookHandler: No line items found in the payload'
        );
      }
      const variants = payload.line_items.map((lineItem) => ({
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
          'handleOrderPaidWebhookHandler: No active sales session found'
        );
      }

      const isPartiallySoldCasesEnabled =
        activeSalesSessionResult.rows[0].partiallySoldEnabled;

      const activeSalesSessionOrderId =
        activeSalesSessionResult.rows[0].orderId;

      const activeSalesSessionId = activeSalesSessionResult.rows[0].id;

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

      const exitingVariants = await query(selectVariantsQuery, [
        variants.map((v) => v.variantId)
      ]);

      if (exitingVariants?.rows?.length === 0) {
        throwError('handleOrderPaidWebhookHandler: No variants found');
      }

      const handleVariantItemsCountPromises = await Promise.allSettled(
        variants.map(async (v) => {
          const exitingVariant = exitingVariants.rows.find(
            (ev) => Number(ev.hubVariantId) === Number(v.variantId)
          );

          return handleVariantItemsCount({
            v,
            activeSalesSessionResult,
            exitingVariant
          });
        })
      );

      const variantsData = handleVariantItemsCountPromises
        .filter((p) => p.status === 'fulfilled')
        .map((p) => p.value);

      if (variantsData.length === 0) {
        return {
          statusCode: 200
        };
      }

      const variantsLineItems = variantsData
        .filter((v) => v.numberOfPackages > 0)
        .map((v) => ({
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
        variants: variantsLineItems,
        activeSalesSessionId,
        customer
      });

      const updateVariantsInventoryPromises = variantsData
        .filter((v) => v.numberOfPackages > 0)
        .map(
          async ({
            hubVariantId,
            noOfItemsPerPackage,
            mappedProducerVariantId,
            numberOfExcessOrders,
            numberOfRemainingOrders,
            hubProductId,
            producerProductId
          }) =>
            updateCurrentVariantInventory({
              storedHubVariant: {
                hubVariantId,
                noOfItemsPerPackage,
                mappedVariantId: mappedProducerVariantId,
                numberOfExcessOrders,
                numberOfRemainingOrders
              },
              hubProductId,
              producerProductId,
              isPartiallySoldCasesEnabled
            })
        );

      await Promise.allSettled(updateVariantsInventoryPromises);

      return {
        statusCode: 200
      };
    } catch (err) {
      await sqlClient.query('ROLLBACK');
      throwError(
        'handleOrderPaidWebhookHandler: Error occurred while processing the query',
        err
      );
    } finally {
      sqlClient.release();
    }
  } catch (err) {
    throwError(
      'handleOrderPaidWebhookHandler: Error occurred while processing the request',
      err
    );
    Sentry.captureException(err);
    return {
      statusCode: 500
    };
  }
};

const handleOrderPaidWebhookCallback = async (topic, shop, body, webhookId) => {
  // without awaiting
  handleOrderPaidWebhook(topic, shop, body, webhookId);
  return {
    statusCode: 200
  };
};

const handleOrderPaidWebhookHandler = {
  ORDERS_PAID: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/api/webhooks',
    callback: handleOrderPaidWebhookCallback
  }
};

export default handleOrderPaidWebhookHandler;
