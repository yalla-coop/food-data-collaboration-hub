/* eslint-disable object-curly-newline */
import moment from 'moment';
import dotenv from 'dotenv';
import updateExistingProductsUseCase from './updateExistingProducts.js';
import { createSalesSession, deactivateAllSalesSessions } from '../../../database/sales-sessions/salesSession.js';
dotenv.config();

const createSalesSessionUseCase = async (
  { startDate: startDateValue, sessionDurationInDays, creatorUserId},
  client
) => {
  const startDate = moment(startDateValue);
  const endDate = moment(startDate).add(sessionDurationInDays, 'days');

  await deactivateAllSalesSessions(client)
  await createSalesSession({startDate, endDate, sessionDurationInDays, active: true, creatorUserId}, client);

  await updateExistingProductsUseCase({
    userId: creatorUserId,
    shouldUpdateThePrice: true
  });
};

export default createSalesSessionUseCase;
