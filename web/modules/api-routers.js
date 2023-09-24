import { Router } from 'express';

import ProductsModules from './products/index.js';
import SalesSessionModules from './sales-session/index.js';

const apiRouter = Router();

apiRouter.use('/products', ProductsModules.Controllers);
apiRouter.use('/sales-session', SalesSessionModules.Controllers);

export default apiRouter;
