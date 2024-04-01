/* eslint-disable no-restricted-syntax */
import { DeliveryMethod } from '@shopify/shopify-api';
import dotenv from 'dotenv';
import { handleOrderWebhook } from './utils/handleOrderWebhook.js';

dotenv.config();

const handleOrderCancelledWebhookCallback = async (
  topic,
  shop,
  body,
  webhookId
) => {
  // without awaiting
  handleOrderWebhook(topic, shop, body, webhookId, 'cancelled');
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
