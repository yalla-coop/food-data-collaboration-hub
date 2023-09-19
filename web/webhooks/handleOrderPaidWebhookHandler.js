import { DeliveryMethod } from '@shopify/shopify-api';
import shopify from '../shopify.js';
import { getClient, query } from '../database/connect.js';
import axios from 'axios';
import dotenv from 'dotenv';
import { convertShopifyGraphQLIdToNumber } from '../utils/index.js';
dotenv.config();

const PRODUCER_SHOP_URL = process.env.PRODUCER_SHOP_URL;
const PRODUCER_SHOP = process.env.PRODUCER_SHOP;

const HUB_SHOP_NAME = process.env.HUB_SHOP_NAME;

export const updateCurrentVariantInventory = async ({
  hubProductId,
  producerProductId,
  hubVariantId,
  noOfItemsPerPackage,
  mappedProducerVariantId
}) => {
  try {
    const sessions = await shopify.config.sessionStorage.findSessionsByShop(
      HUB_SHOP_NAME
    );

    const session = sessions[0];

    const { data } = await axios.post(
      `${PRODUCER_SHOP_URL}fdc/products/all?shop=${PRODUCER_SHOP}`,
      {
        ids: `${producerProductId}`
      }
    );

    const { products: producerProducts } = data;

    const producerProduct = producerProducts[0];

    const mappedProducerVariant = producerProduct.variants.find(
      (v) =>
        convertShopifyGraphQLIdToNumber(v.id) ===
        convertShopifyGraphQLIdToNumber(mappedProducerVariantId)
    );

    const hubProductVariants = await shopify.api.rest.Variant.all({
      session,
      product_id: hubProductId
    });

    const currentVariant = hubProductVariants.find(
      (v) => v.id === hubVariantId
    );

    const inventoryItemId = currentVariant.inventory_item_id;

    const inventoryLevels = await shopify.api.rest.InventoryLevel.all({
      session,
      inventory_item_ids: inventoryItemId
    });

    const inventoryLevel = new shopify.api.rest.InventoryLevel({
      session
    });

    await inventoryLevel.set({
      inventory_item_id: inventoryItemId,
      available:
        noOfItemsPerPackage * Number(mappedProducerVariant.inventory_quantity),
      location_id: inventoryLevels.find(
        (l) => l.inventory_item_id === inventoryItemId
      ).location_id
    });
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

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

    const { variantId: hubVariantId, quantity } = v;

    const sqlClient = await getClient();

    try {
      await sqlClient.query('BEGIN');
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

      const result = await query(selectVariantQuery, [hubVariantId], sqlClient);

      if (result.rows.length === 0) {
        throw new Error('Variant not found');
      }

      const hubProductId = result.rows[0].hubProductId;
      const producerProductId = result.rows[0].producerProductId;
      const mappedProducerVariantId = result.rows[0].mappedVariantId;
      const noOfItemsPerPackage = Number(result.rows[0].noOfItemsPerPackage);
      const numberOfRemainingOrders = Number(
        result.rows[0].numberOfRemainingOrders
      );

      const totalOrders = quantity + numberOfRemainingOrders; // 13

      const numberOfPackages = Math.floor(totalOrders / noOfItemsPerPackage); // 3

      const numberOfRemainingOrdersAfterThisOrder =
        totalOrders % noOfItemsPerPackage; // 1

      const updateVariantQuery = `
    UPDATE variants
    SET number_of_remaining_orders = $1
    WHERE hub_variant_id = $2
    `;
      await query(
        updateVariantQuery,
        [numberOfRemainingOrdersAfterThisOrder, hubVariantId],
        sqlClient
      );

      const selectActiveSalesSessionQuery = `
    SELECT
      *
    FROM sales_sessions
    WHERE is_active = true
    `;

      const activeSalesSessionResult = await query(
        selectActiveSalesSessionQuery,
        [],
        sqlClient
      );

      if (activeSalesSessionResult.rows.length === 0) {
        throw new Error('No active sales session found');
      }

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
        await query(
          updateSalesSessionQuery,
          [newProducerOrderId, activeSalesSessionId],
          sqlClient
        );
        await sqlClient.query('COMMIT');

        await updateCurrentVariantInventory({
          hubProductId,
          producerProductId,
          hubVariantId,
          noOfItemsPerPackage,
          mappedProducerVariantId
        });
      }
    } catch (err) {
      console.log(err);
      await sqlClient.query('ROLLBACK');
    } finally {
      sqlClient.release();
    }
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
};

const handleOrderPaidWebhook = async (topic, shop, body, webhookId) => {
  try {
    const sqlClient = await getClient();
    try {
      await sqlClient.query('BEGIN');
      const selectWebhookQuery = `
          SELECT
          *
          FROM webhooks
          WHERE id = $1
          `;
      const result = await query(selectWebhookQuery, [webhookId], sqlClient);
      if (result.rows.length > 0) {
        return {
          statusCode: 200
        };
      }
      const payload = JSON.parse(body);
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

      const promises = variants.map(
        async (v) => await processOrderPaidWebhook(v)
      );

      await Promise.all(promises);

      return {
        statusCode: 200
      };
    } catch (err) {
      console.log(err);
      await sqlClient.query('ROLLBACK');
      return {
        statusCode: 500
      };
    } finally {
      sqlClient.release();
    }
  } catch (err) {
    console.log(err);
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
