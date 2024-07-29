import { Router } from 'express';

import createSalesSession from './create-sales-session.js';
import getCurrentSalesSession from './get-current-sales-session.js';
import deleteCurrentSalesSession from './delete-current-sales-session.js';
import completeCurrentSalesSession from './complete-current-sales-session.js';

const salesSessionRouter = Router();

salesSessionRouter.post('/', createSalesSession);
salesSessionRouter.get('/', getCurrentSalesSession);
salesSessionRouter.delete('/current', deleteCurrentSalesSession);
salesSessionRouter.patch('/current/complete', completeCurrentSalesSession);

export default salesSessionRouter;
