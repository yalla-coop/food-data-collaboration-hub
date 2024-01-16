import moment from 'moment';
import {getClient} from '../../../database/connect.js';
import createSalesSessionUseCase from '../use-cases/create-sales-session.js';

// Interval will be in days

const createSalesSession = async (req, res, next) => {
  const {
    body: {startDate, sessionDurationInDays},
    user
  } = req;

  // validate the startDate should be in the future

  if (!startDate) {
    return res.status(400).json({
      message: 'Start Date is required'
    });
  }

  if (!sessionDurationInDays) {
    return res.status(400).json({
      message: 'Session Duration is required'
    });
  }

  // check the startDate is in the future

  if (moment(startDate).isBefore(moment().startOf('day'))) {
    return res.status(400).json({
      message: 'Start Date should be in the future'
    });
  }

  const session = res?.locals?.shopify?.session;

  if (!session) {
    return res.status(400).json({
      message: 'No shopify session found'
    });
  }

  const client = await getClient();

  try {
    await client.query('BEGIN');
    await createSalesSessionUseCase(
      {
        startDate,
        sessionDurationInDays,
        user,
        session
      },
      client
    );

    await client.query('COMMIT');

    return res.status(200).json({
      message: 'Sales session created successfully'
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.log('Sales session creation failed : ', err);
    return next(err);
  } finally {
    client.release();
  }
};

export default createSalesSession;
