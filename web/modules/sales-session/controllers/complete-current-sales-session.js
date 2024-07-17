import { getClient, query } from '../../../database/connect.js';
import { getMostRecentActiveSalesSession } from '../../../database/sales-sessions/salesSession.js';
import completeOrderAtProducerStoreUseCase from '../../orders/use-cases/complete-order-at-producer-store.js';

const completeCurrentSalesSession = async (req, res, next) => {
  try {
    const sqlClient = await getClient();
    const {user} = req;
    try {

      const currentSalesSession = await getMostRecentActiveSalesSession(sqlClient)
   
      const currentSalesSessionOrderId = currentSalesSession.orderId;

      const { order } = await completeOrderAtProducerStoreUseCase({
        producerOrderId: currentSalesSessionOrderId,
        user
      });

      const orderId = order.id;

      const updateCurrentSalesSessionSql = `
        UPDATE sales_sessions
        SET is_active = false , order_id = $1
        WHERE is_active = true
        RETURNING *
        `;

      await query(updateCurrentSalesSessionSql, [orderId], sqlClient);

      await sqlClient.query('COMMIT');
    } catch (err) {
      await sqlClient.query('ROLLBACK');
      throw err;
    } finally {
      sqlClient.release();
    }

    return res.status(200).json({
      message: 'Current sales session completed successfully'
    });
  } catch (err) {
    console.log('err', err);
    return next(err);
  }
};

export default completeCurrentSalesSession;
