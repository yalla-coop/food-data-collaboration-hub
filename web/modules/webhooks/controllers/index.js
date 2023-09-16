import { Router } from 'express';
import checkoutCreation from './checkout-creation.js';
import orderCreation from './order-creation.js';
import productUpdate from './product-update.js';
// import verifyShopifyWebhook from './verify-shopify-webhook.js';

// TODO : implement verifyShopifyWebhook
const webhooks = Router();

webhooks.post('/checkout-creation', checkoutCreation);
webhooks.post('/order-creation', orderCreation);
webhooks.post('/product-update', productUpdate);

export default webhooks;
