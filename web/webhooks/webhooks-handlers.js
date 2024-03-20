import { DeliveryMethod } from '@shopify/shopify-api';
import handleProductDeleteWebhookHandler from './handleProductDeleteWebhookHandler.js';
import handleOrderPaidWebhookHandler from './handleOrderPaidWebhookHandler.js';
import handleOrderCancelledWebhookHandler from './handleOrderCancelledWebhookHandler.js';
import handleCartsCreateUpdateCheckoutCreateUpdateWebhookHandler from './handleCartsCreateUpdateCheckoutCreateUpdateWebhookHandler.js';

const GDPRWebhookHandlers = {
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/api/webhooks',
    callback: async () => ({
      statusCode: 200
    })
  },

  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/api/webhooks',
    callback: async () => ({
      statusCode: 200
    })
  },
  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/api/webhooks',
    callback: async () => ({
      statusCode: 200
    })
  }
};

export default {
  ...GDPRWebhookHandlers,
  ...handleProductDeleteWebhookHandler,
  ...handleOrderPaidWebhookHandler,
  ...handleCartsCreateUpdateCheckoutCreateUpdateWebhookHandler,
  ...handleOrderCancelledWebhookHandler,
  PRODUCTS_UPDATE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/api/webhooks',
    callback: async () => ({ statusCode: 200 })
  }
};
