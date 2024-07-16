import { getMostRecentActiveSalesSession } from '../../database/sales-sessions/salesSession.js';
import { throwError } from '../../utils/index.js';

export const getActiveSalesSessionDetails = async (sqlClient) => {
  try {
    const activeSalesSession = await getMostRecentActiveSalesSession(sqlClient);
    
    if (!activeSalesSession) {
      throwError('getActiveSalesSessionDetails: No active sales session found');
    }

    const activeSalesSessionOrderId = activeSalesSession.orderId;

    const activeSalesSessionId = activeSalesSession.id;

    return { activeSalesSessionOrderId, activeSalesSessionId };
  } catch (err) {
    throwError(
      'getActiveSalesSessionDetails: Error occurred while processing the query',
      err
    );
  }
};
