import { query } from '../../database/connect.js';
import { throwError } from '../../utils/index.js';

const selectWebhookQuery = `
SELECT
*
FROM webhooks
WHERE id = $1
`;

const insertWebhookQuery = `
INSERT INTO webhooks (id, topic, data)
VALUES ($1, $2, $3)
`;

export const addOrdersWebhookToDBAndReturnVariants = async (
  webhookId,
  topic,
  body,
  sqlClient
) => {
  try {
    if (!webhookId || !topic || !body) {
      throwError('addOrdersWebhookToDBAndReturnVariants: Invalid input');
    }

    const result = await query(selectWebhookQuery, [webhookId], sqlClient);
    if (result.rows.length > 0) {
      return {
        statusCode: 200
      };
    }
    const payload = JSON.parse(body);

    await sqlClient.query('BEGIN');
    await query(insertWebhookQuery, [webhookId, topic, payload], sqlClient);
    await sqlClient.query('COMMIT');
    if (!payload?.line_items?.length) {
      throwError(
        'addOrdersWebhookToDBAndReturnVariants: No line items found in the payload'
      );
    }
    const variants = payload.line_items.map((lineItem) => ({
      variantId: lineItem.variant_id,
      quantity: Number(lineItem.quantity)
    }));

    return {
      variants,
      orderNumber: payload?.order_number
    };
  } catch (err) {
    await sqlClient.query('ROLLBACK');
    throwError(
      'addOrdersWebhookToDBAndReturnVariants: Error occurred while processing the query',
      err
    );
  }
};
