import { query } from '../../../database/connect.js';
import moment from 'moment';

const editCurrentSalesSessionUseCase = async ({
  startDate,
  sessionDurationInDays
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
      end_date = $3
      WHERE
      is_active = true`;

  try {
    await query(sql, [startDateValue, sessionDurationInDays, endDate]);
  } catch (err) {
    console.error(err);
    throw new Error('Failed to edit sales session', err);
  }
};

export default editCurrentSalesSessionUseCase;
