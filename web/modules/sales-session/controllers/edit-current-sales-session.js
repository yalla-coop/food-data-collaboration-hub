import moment from 'moment';
import editCurrentSalesSessionUseCase from '../use-cases/edit-current-sales-session.js';

const editCurrentSalesSession = async (req, res, next) => {
  try {
    const {
      body: { startDate, sessionDurationInDays, partiallySoldEnabled }
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
