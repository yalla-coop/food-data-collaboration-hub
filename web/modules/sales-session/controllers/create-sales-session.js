import createSalesSessionUseCase from '../use-cases/create-sales-session.js';

// Interval will be in days

const createSalesSession = async (req, res, next) => {
  const {
    body: { startDate, sessionDurationInDays },
    user
  } = req;

  const session = res?.locals?.shopify?.session;

  if (!session) {
    return res.status(400).json({
      message: 'No shopify session found'
    });
  }

  try {
    await createSalesSessionUseCase({
      startDate,
      sessionDurationInDays,
      user,
      session
    });

    return res.status(200).json({
      message: 'Sales session created successfully'
    });
  } catch (err) {
    console.log('err', err);
    return next(err);
  }
};

export default createSalesSession;
