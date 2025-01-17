import moment from 'moment';
import * as Sentry from '@sentry/node';
import dotenv from 'dotenv';
import { getClient } from '../../database/connect.js';
import { getMostRecentActiveSalesSession } from '../../database/sales-sessions/salesSession.js';
import createSalesSessionUseCase from '../sales-session/use-cases/create-sales-session.js';
import shopify from '../../shopify.js';
import { obtainValidAccessToken } from '../../modules/authentication/getNewAccessToken.js';
import { completeOrder } from '../../modules/producer-orders/order.js';
dotenv.config();

const { HUB_SHOP_NAME } = process.env;

// what's happened when the sales session is finished

// 1. create a new sales session
// 2. deactivate the previous sales session
// 3. Mark the order as completed

const createSalesSessionCronJob = async () => {
  let client = null;
  try {
    client = await getClient();
    const sessionId = shopify.api.session.getOfflineId(HUB_SHOP_NAME);

    const session = await shopify.config.sessionStorage.loadSession(sessionId);

    if (!session) {
      throw new Error('Shopify Session not found');
    }
    
    const latestSession = await getMostRecentActiveSalesSession(client);

    if (latestSession) {
      const currentDate = moment(new Date());
      const latestSessionEndDate = moment(latestSession.endDate);

      if (currentDate.isSameOrAfter(latestSessionEndDate)) {
        const newStartDate = moment(latestSessionEndDate).clone();

        try {

          const latestSessionOrder = latestSession.orderId;

          if (latestSessionOrder) {
            const {accessToken} = await obtainValidAccessToken(latestSession.creatorUserId);
            await completeOrder(latestSession, accessToken);
          }

          await client.query('BEGIN');

          await createSalesSessionUseCase(
            {
              startDate: newStartDate.toISOString(),
              sessionDurationInDays: latestSession.sessionDuration,
              session,
              creatorUserId: latestSession.creatorUserId
            },
            client
          );
          await client.query('COMMIT');
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        }
      }
    }
  } catch (err) {
    console.log('err', err);
    Sentry.captureException(err);
  } finally {
    client.release();
  }
};

export default createSalesSessionCronJob;
