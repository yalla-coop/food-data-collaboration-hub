import { query } from '../../../database/connect.js';

const deleteCurrentSalesSession = async () => {
  const sql = `
  UPDATE sales_sessions
    SET
      is_active = false
      WHERE
      is_active = true`;

  try {
    await query(sql);
  } catch (err) {
    console.error(err);
    throw new Error('Failed to delete sales session', err);
  }
};

export default deleteCurrentSalesSession;
