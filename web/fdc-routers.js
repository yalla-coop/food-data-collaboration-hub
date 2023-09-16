import { Router } from 'express';

import Webhooks from './modules/webhooks/index.js';

const fdcRouter = Router();

fdcRouter.use('/webhooks', Webhooks.Controllers);

export default fdcRouter;
