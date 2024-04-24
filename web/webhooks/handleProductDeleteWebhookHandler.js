import * as Sentry from '@sentry/node';
import { DeliveryMethod } from '@shopify/shopify-api';

import { query, getClient } from '../database/connect.js';
import { addOrdersWebhookToDB } from './utils/addOrdersWebhookToDB.js';
import { throwError } from '../utils/index.js';
const deleteVariantsQuery = `
DELETE FROM variants
 WHERE product_id = (
   SELECT id
   FROM products
   WHERE hub_product_id = $1
 )
`;
const deleteProductQuery = `
DELETE FROM products
WHERE hub_product_id = $1
`;

const findVariantQuery = `
     SELECT *
      FROM variants
      WHERE product_id = (
      SELECT id
      FROM products
      WHERE hub_product_id = $1
      )
    `;

export const deleteVariantsAndProductCachedData = async (
  hubProductId,
  sqlClient
) => {
  try {
    await sqlClient.query('BEGIN');

    await query(deleteVariantsQuery, [hubProductId], sqlClient);
    await query(deleteProductQuery, [hubProductId], sqlClient);

    await sqlClient.query('COMMIT');
  } catch (err) {
    await sqlClient.query('ROLLBACK');
    throwError(
      'deleteVariantsAndProductCachedData: Error occurred while processing the query',
      err
    );
  }
};

const handleProductDeleteCallback = async (topic, shop, body, webhookId) => {
  const sqlClient = await getClient();
  try {
    const payload = JSON.parse(body);
    const { id: hubProductId } = payload;

    const { rows: variants } = await query(findVariantQuery, [hubProductId]);

    if (variants.length < 1) {
      return {
        statusCode: 200,
        body: 'Webhook - handleProductDeleteCallback: No variants found'
      };
    }
    await addOrdersWebhookToDB(webhookId, topic, payload, sqlClient);
    console.log(
      `handleProductDeleteCallback: added webhook with id ${webhookId} to db for product id ${hubProductId}`
    );

    await deleteVariantsAndProductCachedData(hubProductId, sqlClient);

    return {
      statusCode: 200
    };
  } catch (err) {
    console.error(
      'handleProductDeleteWebhook: Error occurred while processing the request',
      err
    );
    Sentry.captureException(err);
    return {
      statusCode: 500
    };
  } finally {
    sqlClient.release();
  }
};

const handleProductDeleteWebhookHandler = {
  PRODUCTS_DELETE: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: '/api/webhooks',
    callback: handleProductDeleteCallback
  }
};

export default handleProductDeleteWebhookHandler;
