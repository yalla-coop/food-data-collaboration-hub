/* eslint-disable object-curly-newline */
import moment from 'moment';
import dotenv from 'dotenv';
import { query } from '../../../database/connect.js';
import updateExistingProductsUseCase from './updateExistingProducts.js';
dotenv.config();

const createSalesSessionUseCase = async (
  { startDate, sessionDurationInDays, user },
  client
) => {
  const startDateValue = moment(startDate);
  const endDate = moment(startDate).add(sessionDurationInDays, 'days');

  await query(
    'UPDATE sales_sessions SET is_active = false WHERE is_active = true',
    [],
    client
  );

  const sql =
    'INSERT INTO sales_sessions (start_date, end_date, session_duration, creator_refresh_token, is_active) VALUES ($1,$2,$3,$4,$5) RETURNING id';
  await query(
    sql,
    [
      startDateValue.toISOString(),
      endDate.toISOString(),
      sessionDurationInDays,
      user.refreshToken,
      true
    ],
    client
  );

  await updateExistingProductsUseCase({
    shouldUpdateThePrice: true
  });
};

export default createSalesSessionUseCase;
