import { DeliveryMethod } from '@shopify/shopify-api';
import * as Sentry from '@sentry/node';
import axios from 'axios';
import dotenv from 'dotenv';
import { getClient, query } from '../database/connect.js';
import { updateCurrentVariantInventory } from './updateCurrentVariantInventory.js';
import { calculateTheExcessOrders } from './calculateTheExcessOrders.js';
import { calculateTheRemainingOrders } from './calculateTheRemainingOrders.js';

dotenv.config();

const { PRODUCER_SHOP_URL, PRODUCER_SHOP } = process.env;

const sendOrderToProducer = async ({
  mappedProducerVariantId,
  numberOfPackages,
  activeSalesSessionOrderId
}) => {
  try {
    const { data } = await axios.patch(
      `${PRODUCER_SHOP_URL}fdc/orders/${activeSalesSessionOrderId}?shop=${PRODUCER_SHOP}`,
      {
        userId: '123',
        accessToken: 'access-token',
        orderId: activeSalesSessionOrderId,
        lineItems: [
          {
            variant_id: mappedProducerVariantId,
            quantity: numberOfPackages
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return data.order.id;
  } catch (err) {
    console.log('err from axios', err);
    throw new Error(err);
  }
};

export const processOrderPaidWebhook = async (v) => {
  // increase the number of orders for this variant
  try {
    if (!v) {
      throw new Error('Variant not found');
    }

    if (!v.variantId || !v.quantity) {
      throw new Error('Variant not found');
    }

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
      throw new Error('No active sales session found');
    }

    const { variantId: hubVariantId, quantity } = v;

    try {
      const selectVariantQuery = `
        SELECT
          v.*,
          p.producer_product_id,
          p.hub_product_id
        FROM variants as v
        INNER JOIN products as p
        ON v.product_id = p.id
        WHERE hub_variant_id = $1
    `;

      const result = await query(selectVariantQuery, [hubVariantId]);

      if (result.rows.length === 0) {
        throw new Error('Variant not found');
      }

      const { hubProductId, producerProductId } = result.rows[0];
      const mappedProducerVariantId = result.rows[0].mappedVariantId;
      const noOfItemsPerPackage = Number(result.rows[0].noOfItemsPerPackage);
      const numberOfExitingExcessOrders = Number(
        result.rows[0].numberOfExcessOrders
      );
      const numberOfExitingRemainingOrders = Number(
        result.rows[0].numberOfRemainingOrders
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

      const activeSalesSession = activeSalesSessionResult.rows[0];

      const activeSalesSessionId = activeSalesSession.id;

      const activeSalesSessionOrderId = activeSalesSession.orderId;

      if (numberOfPackages > 0) {
        const newProducerOrderId = await sendOrderToProducer({
          mappedProducerVariantId,
          numberOfPackages,
          activeSalesSessionOrderId
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
        await updateCurrentVariantInventory({
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
        });
      }
    } catch (err) {
      throw new Error(err);
    }
  } catch (err) {
    console.log(err);

    throw new Error(err);
  }
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

      const variants = payload.line_items.map((lineItem) => ({
        variantId: lineItem.variant_id,
        quantity: Number(lineItem.quantity)
      }));

      const promises = variants.map(async (v) => processOrderPaidWebhook(v));

      await Promise.all(promises);

      return {
        statusCode: 200
      };
    } catch (err) {
      console.log(err);
      await sqlClient.query('ROLLBACK');
      throw new Error(err);
    } finally {
      sqlClient.release();
    }
  } catch (err) {
    console.log(err);
    Sentry.captureException(err);
    return {
      statusCode: 500
    };
  }
};

const handleOrderPaidWebhookCallback = async (topic, shop, body, webhookId) => {
  // without awaiting
  console.log('handleOrderPaidWebhookCallback');
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
