import {Router} from 'express'
import checkoutCreation from './checkout-creation.js'
import orderCreation from './order-creation.js';
import verifyShopifyWebhook from './verify-shopify-webhook.js'

const webhooks = Router();

webhooks.post('/checkout-creation', verifyShopifyWebhook, checkoutCreation)
webhooks.post('/order-creation', verifyShopifyWebhook, orderCreation);

export default webhooks;
