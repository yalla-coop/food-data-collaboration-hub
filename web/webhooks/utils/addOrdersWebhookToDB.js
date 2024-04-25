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

export const addOrdersWebhookToDB = async (
  webhookId,
  topic,
  payload,
  sqlClient
) => {
  try {
    if (!webhookId || !topic || !payload) {
      throwError('addOrdersWebhookToDB: Invalid input');
    }

    const result = await query(selectWebhookQuery, [webhookId], sqlClient);
    if (result.rows.length > 0) {
      return {
        statusCode: 200
      };
    }

    await sqlClient.query('BEGIN');
    await query(insertWebhookQuery, [webhookId, topic, payload], sqlClient);
    await sqlClient.query('COMMIT');
  } catch (err) {
    await sqlClient.query('ROLLBACK');
    throwError(
      'addOrdersWebhookToDB: Error occurred while processing the query',
      err
    );
  }
};
