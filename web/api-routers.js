import { Router } from 'express';

import ProductsModules from './modules/products/index.js';

const apiRouter = Router();

apiRouter.use('/products', ProductsModules.Controllers);

export default apiRouter;
