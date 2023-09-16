import { query } from '../../../database/connect.js';

const getCurrentSalesSessionUseCase = async () => {
  try {
    const sql = 'SELECT * FROM sales_sessions WHERE is_active = true';

    const result = await query(sql);

    return result.rows[0];
  } catch (err) {
    throw new Error(err);
  }
};

export default getCurrentSalesSessionUseCase;
