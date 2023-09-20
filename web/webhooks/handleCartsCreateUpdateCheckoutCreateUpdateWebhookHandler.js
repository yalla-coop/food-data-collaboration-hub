import { DeliveryMethod } from '@shopify/shopify-api';
import { getClient } from '../database/connect.js';
import { updateCurrentVariantInventory } from './updateCurrentVariantInventory.js';
import { getStoredHubVariant } from './getStoredHubVariant.js';
import { query } from '../database/connect.js';
export const handleHubVariantUpdate = async (v) => {
  const { variantId, quantity } = v;

  if (!variantId || !quantity) {
    return;
  }

  try {
    const {
      hubProductId,
      producerProductId,
      hubVariantId,
      noOfItemsPerPackage,
      mappedProducerVariantId,
      numberOfExitingExcessOrders
    } = await getStoredHubVariant({
      variantId,
      quantity
    });

    await updateCurrentVariantInventory({
      hubProductId,
      producerProductId,
      hubVariantId,
      noOfItemsPerPackage,
      mappedProducerVariantId,
      numberOfExcessOrders: numberOfExitingExcessOrders
    });
  } catch (e) {
    console.log(e);
  }
};

const handleCartCreateUpdateCheckoutCreateUpdateWebhook = async (
  topic,
  shop,
  body,
  webhookId
) => {
  // The value of this function just to check the inventory of the product and update the inventory of the product

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
      const webhook = result.rows[0];
      if (webhook) {
        return;
      }

      const payload = JSON.parse(body);
      const insertWebhookQuery = `
          INSERT INTO webhooks
          (id,topic,data)
          VALUES ($1,$2,$3)
    `;
      await query(insertWebhookQuery, [webhookId, topic, payload], sqlClient);
      await sqlClient.query('COMMIT');

      const variants = payload.line_items.map((lineItem) => ({
        variantId: lineItem.variant_id,
        quantity: Number(lineItem.quantity)
      }));

      console.log('variants', variants);

      const promises = variants.map(
        async (v) => await handleHubVariantUpdate(v)
      );

      await Promise.all(promises);
    } catch (err) {
      await sqlClient.query('ROLLBACK');
      throw new Error(err);
    } finally {
      sqlClient.release();
    }
  } catch (err) {
    console.log('Error:----', err);
  }
};

const handleCartCreateUpdateCheckoutCreateUpdateWebhookCallback = async (
  topic,
  shop,
  body,
  webhookId
) => {
  console.log('topic new ----', topic);
  //without waiting
  handleCartCreateUpdateCheckoutCreateUpdateWebhook(
    topic,
    shop,
    body,
    webhookId
  );
  return {
    statusCode: 200
  };
};

const handleCartsCreateUpdateCheckoutCreateUpdateWebhookHandler = {
  CARTS_CREATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/api/webhooks',
    callback: handleCartCreateUpdateCheckoutCreateUpdateWebhookCallback
  },
  CARTS_UPDATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/api/webhooks',
    callback: handleCartCreateUpdateCheckoutCreateUpdateWebhookCallback
  },
  CHECKOUTS_CREATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/api/webhooks',
    callback: handleCartCreateUpdateCheckoutCreateUpdateWebhookCallback
  },
  CHECKOUTS_UPDATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/api/webhooks',
    callback: handleCartCreateUpdateCheckoutCreateUpdateWebhookCallback
  }
};

export default handleCartsCreateUpdateCheckoutCreateUpdateWebhookHandler;
