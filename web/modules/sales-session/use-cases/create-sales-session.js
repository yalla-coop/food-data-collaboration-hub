/* eslint-disable object-curly-newline */
import moment from 'moment';
import dotenv from 'dotenv';
import {query} from '../../../database/connect.js';
import createOrderAtProducerStore from '../../../modules/orders/use-cases/create-order-at-producer-store.js';
import updateExistingProductsUseCase from './updateExistingProducts.js';

dotenv.config();

const createSalesSessionUseCase = async (
  {startDate, sessionDurationInDays, user},
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
      'INSERT INTO sales_sessions (start_date, end_date,session_duration,is_active,partially_sold_enabled ) VALUES ($1,$2,$3,$4,$5) RETURNING id';
    const result = await query(
      sql,
      [
        startDateValue.toISOString(),
        endDate.toISOString(),
        sessionDurationInDays,
        true,
        // setting partially sold enabled to true by default: https://github.com/yalla-coop/food-data-collaboration/issues/92
        true
      ],
      client
    );

    const salesSessionId = result.rows[0].id;

    const {order} = await createOrderAtProducerStore({
      user
    });

    await query(
      'UPDATE sales_sessions SET order_id = $1 WHERE id = $2',
      [order.id, salesSessionId],
      client
    );
    // TODO : this function should update the price also
    await updateExistingProductsUseCase({
      isPartiallySoldCasesEnabled: true,
      shouldUpdateThePrice: true
    });
  } catch (error) {
    console.error(error);
    console.log('Failed to create sales session', error);
    throw new Error('Failed to create sales session', error);
  }
};

export default createSalesSessionUseCase;
