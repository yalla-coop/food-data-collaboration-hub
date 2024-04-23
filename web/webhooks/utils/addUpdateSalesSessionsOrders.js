import { query } from '../../database/connect.js';

const addSalesSessionsOrdersQuery = `
INSERT INTO sales_sessions_orders (sales_session_id, webhooks_id, order_number, order_type, status)
VALUES ($1, $2, $3, $4, $5)
RETURNING id
`;

const updateSalesSessionsOrdersStatusQuery = `
UPDATE sales_sessions_orders
SET status = $1
WHERE id = $2
`;

export const addSalesSessionsOrder = async ({
  salesSessionId,
  webhookId,
  orderNumber,
  orderType,
  orderStatus,
  sqlClient
}) => {
  try {
    await sqlClient.query('BEGIN');
    const result = await query(
      addSalesSessionsOrdersQuery,
      [salesSessionId, webhookId, orderNumber, orderType, orderStatus],
      sqlClient
    );
    await sqlClient.query('COMMIT');
    return { salesSessionsOrderId: result?.rows[0]?.id };
  } catch (error) {
    // Note: not throwing error here as this function is used for logging purposes
    console.log('addSalesSessionsOrder error from catch', error);
    await sqlClient.query('ROLLBACK');
  }
};

export const updateSalesSessionsOrdersStatus = async ({
  salesSessionsOrderId,
  status,
  sqlClient
}) => {
  try {
    await sqlClient.query('BEGIN');
    await query(
      updateSalesSessionsOrdersStatusQuery,
      [status, salesSessionsOrderId],
      sqlClient
    );
    await sqlClient.query('COMMIT');
  } catch (error) {
    console.log('updateSalesSessionsOrdersStatus error from catch', error);
    await sqlClient.query('ROLLBACK');
  }
};
