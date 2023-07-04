import Router from 'express';

import Products from './modules/products/index.js';
import Webhooks from './modules/webhooks/index.js';

const router = Router();

router.use('/products', Products.Controllers);
router.use('/webhooks', Webhooks.Controllers);

export default router;
