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

    const isPartiallySoldCasesEnabled =
      activeSalesSessions?.[0]?.partiallySoldEnabled;

    await updateExistingProductsUseCase({
      isPartiallySoldCasesEnabled
    });
  } catch (err) {
    console.log('Error in updateExistingProductsCronJob', err);
  }
};

export default updateExistingProductsCronJob;
