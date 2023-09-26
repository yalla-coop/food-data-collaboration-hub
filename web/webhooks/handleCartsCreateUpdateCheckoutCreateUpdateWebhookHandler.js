import { DeliveryMethod } from '@shopify/shopify-api';
import * as Sentry from '@sentry/node';

import { getClient, query } from '../database/connect.js';
import { updateCurrentVariantInventory } from './updateCurrentVariantInventory.js';
import { getStoredHubVariant } from './getStoredHubVariant.js';

export const handleHubVariantUpdate = async (v, activeSalesSession) => {
  const { variantId, quantity } = v;

  if (!variantId || !quantity) {
    return;
  }

  const isPartiallySoldCasesEnabled = activeSalesSession.partiallySoldEnabled;

  try {
    const {
      hubProductId,
      producerProductId,
      hubVariantId,
      noOfItemsPerPackage,
      mappedProducerVariantId,
      numberOfExitingExcessOrders,
      numberOfExitingRemainingOrders
    } = await getStoredHubVariant({
      variantId,
      quantity
    });

    await updateCurrentVariantInventory({
      isPartiallySoldCasesEnabled,
      hubProductId,
      storedHubVariant: {
        hubVariantId,
        noOfItemsPerPackage,
        mappedVariantId: mappedProducerVariantId,
        numberOfExcessOrders: numberOfExitingExcessOrders,
        numberOfRemainingOrders: numberOfExitingRemainingOrders
      },
      producerProductId
    });
  } catch (e) {
    console.log(e);
    throw new Error(e);
  }
};

const handleCartCreateUpdateCheckoutCreateUpdateWebhook = async (
  topic,
  shop,
  body,
  webhookId
) => {
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

      const selectActiveSalesSessionQuery = `
          SELECT
          *
          FROM sales_sessions
          WHERE active = true
        `;

      const activeSalesSessionResult = await query(
        selectActiveSalesSessionQuery
      );

      const activeSalesSession = activeSalesSessionResult.rows[0];

      if (!activeSalesSession) {
        throw new Error('No active sales session found');
      }

      const variants = payload.line_items.map((lineItem) => ({
        variantId: lineItem.variant_id,
        quantity: Number(lineItem.quantity)
      }));

      const promises = variants.map(async (v) =>
        handleHubVariantUpdate(v, activeSalesSession)
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
    Sentry.captureException(err);
  }
};

const handleCartCreateUpdateCheckoutCreateUpdateWebhookCallback = async (
  topic,
  shop,
  body,
  webhookId
) => {
  console.log('handleCartCreateUpdateCheckoutCreateUpdateWebhookCallback');
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
