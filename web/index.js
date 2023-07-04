// @ts-check
import {join} from 'path';
import {readFileSync} from 'fs';
import express from 'express';
import serveStatic from 'serve-static';
import routers from './routers.js';
import shopify from './shopify.js';
import GDPRWebhookHandlers from './gdpr.js';
import bodyParser from 'body-parser';

const port = process.env.BACKEND_PORT || process.env.PORT || '3000';

const PORT = parseInt(port, 10);

const STATIC_PATH =
  process.env.NODE_ENV === 'production'
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf
  }
}))

//app.get(shopify.config.auth.path, shopify.auth.begin());
//app.get(
//  shopify.config.auth.callbackPath,
//  shopify.auth.callback(),
//  shopify.redirectToShopifyOrAppRoot()
//);

//app.use('/api/*', shopify.validateAuthenticatedSession());
app.use('/api', routers);

//app.use('/*', shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
//  console.log('Serving frontend');
//  console.log('req', _req.url);
//  return res
//    .status(200)
//    .set('Content-Type', 'text/html')
//    .send(readFileSync(join(STATIC_PATH, 'index.html')));
//});

app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({
    webhookHandlers: GDPRWebhookHandlers
  })
);

app.use(express.json());

app.use(serveStatic(STATIC_PATH, {index: false}));

app.listen(PORT);
