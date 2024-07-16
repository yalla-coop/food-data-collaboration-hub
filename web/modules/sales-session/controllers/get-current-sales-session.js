import {getMostRecentActiveSalesSession} from '../../../database/sales-sessions/salesSession.js';
import {getClient} from '../../../database/connect.js';

const getCurrentSalesSession = async (req, res, next) => {
  let client = null;
  try {
    client = await getClient();

    const currentSalesSession = await getMostRecentActiveSalesSession(client);

    return res.status(200).json({
      message: 'Sales session retrieved successfully',
      currentSalesSession
    });
  } catch (err) {
    console.log('err', err);
    return next(err);
  } finally {
    client.release();
  }
};

export default getCurrentSalesSession;
