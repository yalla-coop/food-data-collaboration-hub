import deleteCurrentSalesSession from '../../sales-session/use-cases/delete-current-sales-session.js';

const deleteSalesSession = async (req, res) => {
  try {
    await deleteCurrentSalesSession();
    return res.status(200).json({
      message: 'Sales session deleted successfully'
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Failed to delete sales session'
    });
  }
};

export default deleteSalesSession;
