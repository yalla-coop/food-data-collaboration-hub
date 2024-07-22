import { getMostRecentActiveSalesSession, deactivateAllSalesSessions } from '../../../database/sales-sessions/salesSession.js';
import { completeOrder } from '../../producer-orders/order.js';
const completeCurrentSalesSession = async (req, res, next) => {
  try {
    const currentSalesSession = await getMostRecentActiveSalesSession(sqlClient)

    await completeOrder(currentSalesSession, req.user.accessToken);
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
