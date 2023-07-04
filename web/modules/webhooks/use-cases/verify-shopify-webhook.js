import crypto from 'crypto'

const verifyShopifyWebhook = async ({ rawBody, hmac, shopifyWebhookSecret }) => {

  // Create a hash using the body and our key
  const hash = crypto
    .createHmac('sha256', shopifyWebhookSecret)
    .update(rawBody, 'utf8', 'hex')
    .digest('base64')
  
  if (hash === hmac) {
    // From Shopify!
    return true
  } else {
    // Not from Shopify!
    return false
  }
};

export default verifyShopifyWebhook
