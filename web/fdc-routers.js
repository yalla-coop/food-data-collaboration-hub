import {Router} from 'express';

import OrdersModules from './modules/orders/index.js';

const fdcRouter = Router();

fdcRouter.use('/orders', OrdersModules.Controllers);

export default fdcRouter;