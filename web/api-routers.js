import { Router } from 'express';

import ProductsModules from './modules/products/index.js';
import SalesSessionModules from './modules/sales-session/index.js';

const apiRouter = Router();

apiRouter.use('/products', ProductsModules.Controllers);
apiRouter.use('/sales-session', SalesSessionModules.Controllers);

export default apiRouter;
