import getCurrentSalesSessionUseCase from '../use-cases/get-current-sales-session.js';

const getCurrentSalesSession = async (req, res, next) => {
  try {
    const currentSalesSession = await getCurrentSalesSessionUseCase();
    return res.status(200).json({
      message: 'Sales session retrieved successfully',
      currentSalesSession
    });
  } catch (err) {
    console.log('err', err);
    return next(err);
  }
};

export default getCurrentSalesSession;
