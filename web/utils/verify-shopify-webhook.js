import { config } from '../../../config.js';
import WebhookUseCases from '../modules/webhooks/use-cases/index.js';

const verifyShopifyWebhook = async (req, res, next) => {
  console.log('----------------------------------');

  const hmac = req.get('X-Shopify-Hmac-Sha256');

  try {
    if (
      WebhookUseCases.verifyShopifyWebhook({
        rawBody: req.rawBody,
        hmac,
        shopifyWebhookSecret: config.SHOPIFY_WEBHOOK_SECRET
      })
    ) {
      next();
    } else {
      console.warn('Shopify webhook verification failed', req.body);
      res.sendStatus(403);
    }
  } catch (e) {
    console.warn('verifyShopifyWebhook error', e);
    res.sendStatus(500);
  }
};

export default verifyShopifyWebhook;
