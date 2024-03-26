import { query } from '../../database/connect.js';
import { throwError } from '../../utils/index.js';
import { sendOrderToProducer } from './sendOrderToProducer.js';

const updateSalesSessionQuery = `
UPDATE sales_sessions
SET order_id = $1
WHERE id = $2
`;

export const sendOrderToProducerAndUpdateSalesSessionOrderId = async ({
  activeSalesSessionOrderId,
  variants,
  activeSalesSessionId,
  customer,
  orderType,
  sqlClient
}) => {
  let producerRespondSuccess = false;
  try {
    if (!activeSalesSessionOrderId || !variants.length) {
      throwError(
        'sendOrderToProducerAndUpdateSalesSessionOrderId: Missing activeSalesSessionOrderId or variants'
      );
    }

    const newProducerOrderId = await sendOrderToProducer({
      activeSalesSessionOrderId,
      variants,
      customer,
      orderType
    });
    if (!newProducerOrderId) {
      throwError(
        'sendOrderToProducerAndUpdateSalesSessionOrderId: No new order id sent by producer'
      );
    }
    await sqlClient.query('BEGIN');
    const result = await query(updateSalesSessionQuery, [
      newProducerOrderId,
      activeSalesSessionId
    ]);
    await sqlClient.query('COMMIT');

    if (result.rowCount === 0) {
      throwError(
        'sendOrderToProducerAndUpdateSalesSessionOrderId: No rows updated in sales_sessions table'
      );
    }

    producerRespondSuccess = true;

    return { producerRespondSuccess, newProducerOrderId };
  } catch (error) {
    await sqlClient.query('ROLLBACK');
    throwError(
      'sendOrderToProducerAndUpdateSalesSessionOrderId: Error occurred while sending the order to producer',
      error
    );
  }
};
