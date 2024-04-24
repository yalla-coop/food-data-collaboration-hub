/* eslint-disable no-restricted-syntax */
import { DeliveryMethod } from '@shopify/shopify-api';
import dotenv from 'dotenv';
import { handleOrderWebhook } from './utils/handleOrderWebhook.js';
import { validateLineItemsAndCallHandler } from './utils/validateLineItemsAndCallHandler.js';

dotenv.config();

const handleOrderPaidWebhookCallback = async (topic, shop, body, webhookId) => {
  // without awaiting

  validateLineItemsAndCallHandler(
    { topic, shop, body, webhookId, orderType: 'completed' },
    handleOrderWebhook
  );

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
