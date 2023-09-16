import { getClient, query } from '../../../database/connect.js';
import moment from 'moment';
import dotenv from 'dotenv';
import createSalesSessionUseCase from '../use-cases/create-sales-session.js';
import completeOrderAtProducerStoreUseCase from '../../orders/use-cases/complete-order-at-producer-store.js';
import shopify from '../../../shopify.js';

dotenv.config();

const HUB_SHOP_NAME = process.env.HUB_SHOP_NAME;

// what's happened when the sales session is created

// 1. create a order in the producer side
// 2. create a order in the consumer side

// what's happened when the sales session is finished

// 1. create a new sales session
// 2. deactivate the previous sales session
// 3. Mark the order as completed

export const createSalesSessionCronJob = async () => {
  try {
    const sessions = await shopify.config.sessionStorage.findSessionsByShop(
      HUB_SHOP_NAME
    );

    const session = sessions[0];

    const sql =
      'SELECT * FROM sales_sessions WHERE is_active = true ORDER BY end_date DESC LIMIT 1';
    const result = await query(sql);

    if (result.rows.length > 0) {
      const latestSession = result.rows[0];
      const currentDate = moment(new Date());
      const latestSessionEndDate = moment(latestSession.endDate);

      if (currentDate.isSameOrAfter(latestSessionEndDate)) {
        const newStartDate = moment(latestSessionEndDate).clone();
        const client = await getClient();
        try {
          await client.query('BEGIN');

          // get the latest sales session

          const latestSessionSql = `
            SELECT * FROM sales_sessions
            WHERE is_active = true
            `;

          const latestSessionResult = await query(latestSessionSql, [], client);

          const latestSession = latestSessionResult.rows[0];

          const latestSessionOrder = latestSession.orderId;

          if (latestSessionOrder) {
            await completeOrderAtProducerStoreUseCase({
              producerOrderId: latestSessionOrder,
              user: {
                id: 212,
                accessToken: 'access_token'
              }
            });
          }

          const deActivePreviousSessionsSql =
            'UPDATE sales_sessions SET is_active = false WHERE is_active = true';
          await query(deActivePreviousSessionsSql, [], client);

          // create a new sales session
          await createSalesSessionUseCase(
            {
              startDate: newStartDate.toISOString(),
              sessionDurationInDays: latestSession.sessionDuration,
              session,
              user: {
                id: 212,
                accessToken: 'access_token'
              }
            },
            client
          );
          await client.query('COMMIT');
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      }
    }
  } catch (err) {
    console.log('err', err);
  }
};
