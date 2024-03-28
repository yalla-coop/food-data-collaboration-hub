import { query } from '../../database/connect.js';
import { throwError } from '../../utils/index.js';

const selectActiveSalesSessionQuery = `
SELECT
  *
FROM sales_sessions
WHERE is_active = true
`;

export const getActiveSalesSessionDetails = async (sqlClient) => {
  try {
    const activeSalesSessionResult = await query(
      selectActiveSalesSessionQuery,
      [],
      sqlClient
    );

    if (activeSalesSessionResult.rows.length === 0) {
      throwError('getActiveSalesSessionDetails: No active sales session found');
    }

    const activeSalesSessionOrderId = activeSalesSessionResult.rows[0].orderId;

    const activeSalesSessionId = activeSalesSessionResult.rows[0].id;

    return { activeSalesSessionOrderId, activeSalesSessionId };
  } catch (err) {
    throwError(
      'getActiveSalesSessionDetails: Error occurred while processing the query',
      err
    );
  }
};
