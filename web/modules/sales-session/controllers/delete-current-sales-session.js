
import { getClient } from '../../../database/connect.js';
import { deactivateAllSalesSessions } from '../../../database/sales-sessions/salesSession.js';

const deleteSalesSession = async (req, res) => {
  let client = null;
  try {
    client = await getClient();
    
    await deactivateAllSalesSessions(client);

    return res.status(200).json({
      message: 'Sales session deleted successfully'
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Failed to delete sales session'
    });
  } finally {
    client.release();
  }
};

export default deleteSalesSession;
