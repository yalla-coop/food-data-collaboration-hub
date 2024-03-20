/* eslint-disable object-curly-newline */
import moment from 'moment';
import dotenv from 'dotenv';
import { query } from '../../../database/connect.js';
import createOrderAtProducerStore from '../../../modules/orders/use-cases/create-order-at-producer-store.js';
import updateExistingProductsUseCase from './updateExistingProducts.js';
import { throwError } from '../../../utils/index.js';

dotenv.config();

const createSalesSessionUseCase = async (
  { startDate, sessionDurationInDays, user },
  client
) => {
  try {
    const startDateValue = moment(startDate);
    const endDate = moment(startDate).add(sessionDurationInDays, 'days');

    await query(
      'UPDATE sales_sessions SET is_active = false WHERE is_active = true',
      [],
      client
    );

    const sql =
      'INSERT INTO sales_sessions (start_date, end_date,session_duration,is_active) VALUES ($1,$2,$3,$4) RETURNING id';
    const result = await query(
      sql,
      [
        startDateValue.toISOString(),
        endDate.toISOString(),
        sessionDurationInDays,
        true
      ],
      client
    );

    const salesSessionId = result.rows[0].id;

    const { order } = await createOrderAtProducerStore({
      user
    });

    await query(
      'UPDATE sales_sessions SET order_id = $1 WHERE id = $2',
      [order.id, salesSessionId],
      client
    );
    // TODO : this function should update the price also
    await updateExistingProductsUseCase({
      shouldUpdateThePrice: true
    });
  } catch (error) {
    throwError('Error from createSalesSessionUseCase', error);
  }
};

export default createSalesSessionUseCase;
