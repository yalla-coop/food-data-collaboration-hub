import { DeliveryMethod } from '@shopify/shopify-api';
import * as Sentry from '@sentry/node';

import { query, getClient } from '../database/connect.js';

export const deleteVariantsAndProductCachedData = async (hubProductId) => {
  try {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const deleteVariantsQuery = `
     DELETE FROM variants
      WHERE product_id = (
        SELECT id
        FROM products
        WHERE hub_product_id = $1
      )
    `;
      await query(deleteVariantsQuery, [hubProductId], client);

      const deleteProductQuery = `
      DELETE FROM products
      WHERE hub_product_id = $1
    `;

      await query(deleteProductQuery, [hubProductId], client);

      await client.query('COMMIT');
    } catch (err) {
      console.log(err);

      await client.query('ROLLBACK');
      throw new Error(err);
    } finally {
      client.release();
    }

    throw new Error('test error');
  } catch (err) {
    console.log(err);
    Sentry.captureException(err);
  }
};

const handleProductDeleteCallback = async (topic, shop, body, webhookId) => {
  const payload = JSON.parse(body);

  const { id: producerProductId } = payload;
  // we should not await this
  // function because it will take a long time and we should reply to shopify as soon as possible
  console.log('deleting product webhook');
  deleteVariantsAndProductCachedData(producerProductId);

  return {
    statusCode: 200
  };
};

const handleProductDeleteWebhookHandler = {
  PRODUCTS_DELETE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/api/webhooks',
    callback: handleProductDeleteCallback
  }
};

export default handleProductDeleteWebhookHandler;
