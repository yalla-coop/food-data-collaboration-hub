import { DeliveryMethod } from '@shopify/shopify-api';
import handleProductDeleteWebhookHandler from './webhooks/handleProductDeleteWebhookHandler.js';
import handleOrderPaidWebhookHandler from './webhooks/handleOrderPaidWebhookHandler.js';
import handleCartsCreateUpdateCheckoutCreateUpdateWebhookHandler from './webhooks/handleCartsCreateUpdateCheckoutCreateUpdateWebhookHandler.js';

const GDPRWebhookHandlers = {
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/api/webhooks',
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
    }
  },

  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/api/webhooks',
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
    }
  },
  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/api/webhooks',
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
    }
  }
};

export default {
  ...GDPRWebhookHandlers,
  ...handleProductDeleteWebhookHandler,
  ...handleOrderPaidWebhookHandler,
  ...handleCartsCreateUpdateCheckoutCreateUpdateWebhookHandler,
  PRODUCTS_UPDATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/api/webhooks',
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      return {
        statusCode: 200
      };
    }
  }
};
