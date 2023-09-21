import { query } from '../../../database/connect.js';
import moment from 'moment';

// TODO : change the variants (number of excess orders and number of remaining orders) when change the is partially sold enabled
const editCurrentSalesSessionUseCase = async ({
  startDate,
  sessionDurationInDays,
  partiallySoldEnabled
}) => {
  const startDateValue = moment(startDate).toISOString();
  const endDate = moment(startDate)
    .add(sessionDurationInDays, 'days')
    .toISOString();

  const sql = `
  UPDATE sales_sessions
    SET
      start_date = $1, 
      session_duration = $2,
      end_date = $3,
      partially_sold_enabled = $4
      WHERE
      is_active = true`;

  try {
    await query(sql, [
      startDateValue,
      sessionDurationInDays,
      endDate,
      partiallySoldEnabled
    ]);
  } catch (err) {
    console.error(err);
    throw new Error('Failed to edit sales session', err);
  }
};

export default editCurrentSalesSessionUseCase;