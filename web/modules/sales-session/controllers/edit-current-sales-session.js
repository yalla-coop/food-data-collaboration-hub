import editCurrentSalesSessionUseCase from '../use-cases/edit-current-sales-session.js';

const editCurrentSalesSession = async (req, res, next) => {
  try {
    const {
      body: { startDate, sessionDurationInDays }
    } = req;

    await editCurrentSalesSessionUseCase({
      startDate,
      sessionDurationInDays
    });
    return res.status(200).json({
      message: 'Sales session updated successfully'
    });
  } catch (err) {
    console.log('err', err);
    return next(err);
  }
};

export default editCurrentSalesSession;
