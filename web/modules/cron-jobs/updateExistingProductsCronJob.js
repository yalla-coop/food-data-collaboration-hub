import * as Sentry from '@sentry/node';
import updateExistingProductsUseCase from '../sales-session/use-cases/updateExistingProducts.js';
import { query } from '../../database/connect.js';

const updateExistingProductsCronJob = async () => {
  try {
    const selectActiveSalesSessionSql = `
    SELECT * FROM sales_sessions WHERE is_active = true LIMIT 1
    `;
    const { rows: activeSalesSessions } = await query(
      selectActiveSalesSessionSql
    );
    if (activeSalesSessions.length === 0) {
      return;
    }

    await updateExistingProductsUseCase({});
  } catch (err) {
    console.log('Error in updateExistingProductsCronJob', err);
    Sentry.captureException(err);
  }
};

export default updateExistingProductsCronJob;
