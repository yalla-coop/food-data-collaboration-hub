import { Router } from 'express';

import createSalesSession from './create-sales-session.js';
import getCurrentSalesSession from './get-current-sales-session.js';
import editCurrentSalesSession from './edit-current-sales-session.js';

const salesSessionRouter = Router();

salesSessionRouter.post('/', createSalesSession);
salesSessionRouter.get('/', getCurrentSalesSession);
salesSessionRouter.patch('/current', editCurrentSalesSession);

export default salesSessionRouter;
