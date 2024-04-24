import { DeliveryMethod } from '@shopify/shopify-api';
import * as Sentry from '@sentry/node';

import { getClient } from '../database/connect.js';
import { updateCurrentVariantInventory } from './updateCurrentVariantInventory.js';

import { addOrdersWebhookToDB } from './utils/addOrdersWebhookToDB.js';
import { validateLineItemsAndCallHandler } from './utils/validateLineItemsAndCallHandler.js';
import { throwError } from '../utils/index.js';

export const handleHubVariantUpdate = async (singleVariantFromDB) => {
  if (!singleVariantFromDB) {
    return;
  }

  try {
    const {
      hubProductId,
      producerProductId,
      hubVariantId,
      noOfItemsPerPackage,
      mappedVariantId,
      numberOfExcessOrders
    } = singleVariantFromDB;

    await updateCurrentVariantInventory({
      hubProductId,
      storedHubVariant: {
        hubVariantId,
        noOfItemsPerPackage,
        mappedVariantId,
        numberOfExcessOrders
      },
      producerProductId
    });
  } catch (e) {
    throwError('handleHubVariantUpdate: Error updating variant inventory', e);
  }
};

const handleCartCreateUpdateCheckoutCreateUpdateWebhook = async ({
  topic,
  webhookId,
  payload,
  activeSalesSessions,
  variantsFromPayload,
  variantsFromDB
}) => {
  const sqlClient = await getClient();
  try {
    await addOrdersWebhookToDB(webhookId, topic, payload, sqlClient);

    console.log(`handleCartsWebhook: added webhook with id ${webhookId} to db`);

    const activeSalesSession = activeSalesSessions?.[0];

    if (!activeSalesSession) {
      throw new Error('No active sales session found');
    }

    const promises = variantsFromPayload.map(async (v) => {
      const singleVariantFromDB = variantsFromDB.find(
        (ev) => Number(ev.hubVariantId) === Number(v.variantId)
      );
      return handleHubVariantUpdate(singleVariantFromDB);
    });

    await Promise.all(promises);
    console.log('handleCartWebhook: Updated inventory for variants, all done!');
  } catch (err) {
    Sentry.captureException(err);
    return {
      statusCode: 500
    };
  } finally {
    sqlClient.release();
  }
};

const handleCartCreateUpdateCheckoutCreateUpdateWebhookCallback = async (
  topic,
  shop,
  body,
  webhookId
) => {
  validateLineItemsAndCallHandler(
    { topic, shop, body, webhookId },
    handleCartCreateUpdateCheckoutCreateUpdateWebhook
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
