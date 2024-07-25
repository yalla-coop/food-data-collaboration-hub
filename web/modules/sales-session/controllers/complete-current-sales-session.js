import { getMostRecentActiveSalesSession, deactivateAllSalesSessions } from '../../../database/sales-sessions/salesSession.js';
import { completeOrder } from '../../producer-orders/order.js';
import {obtainValidAccessToken} from  '../../authentication/getNewAccessToken.js'
const completeCurrentSalesSession = async (req, res, next) => {
  try {
    const currentSalesSession = await getMostRecentActiveSalesSession();

    if (currentSalesSession.orderId) {
      const accessToken = await obtainValidAccessToken(req.user.id);
      await completeOrder(currentSalesSession, accessToken);
    }

    await deactivateAllSalesSessions();

    return res.status(200).json({
      message: 'Current sales session completed successfully'
    });
  } catch (err) {
    console.log('err', err);
    return next(err);
  }
};

export default completeCurrentSalesSession;
