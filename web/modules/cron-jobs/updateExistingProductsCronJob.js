import * as Sentry from '@sentry/node';
import updateExistingProductsUseCase from '../sales-session/use-cases/updateExistingProducts.js';
import { getClient} from '../../database/connect.js';
import { getMostRecentActiveSalesSession } from '../../database/sales-sessions/salesSession.js';

const updateExistingProductsCronJob = async () => {
  let client = null;
  try {
    client = await getClient();

    const activeSalesSession = await getMostRecentActiveSalesSession(client)
    if (!activeSalesSession) {
      return;
    }

    await updateExistingProductsUseCase({userId: activeSalesSession.creatorUserId});
  } catch (err) {
    console.log('Error in updateExistingProductsCronJob', err);
    Sentry.captureException(err);
  } finally {
    client.release();
  }
};

export default updateExistingProductsCronJob;
