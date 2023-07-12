// @ts-check
import {join} from 'path';
import {readFileSync} from 'fs';
import express from 'express';
import serveStatic from 'serve-static';
import apiRouters from './api-routers.js';
import session from 'express-session'
import {sessionStore, oidcRouter} from './oidc-router.js';
import shopify from './shopify.js';
import GDPRWebhookHandlers from './gdpr.js';
import addSessionShopToReqParams from './middleware/addSessionShopToReqParameters.js';
import { config } from './config.js'

const STATIC_PATH =
  process.env.NODE_ENV === 'production'
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

app.use('/*', session({
  secret: config.OIDC_SESSION_SECRET || 'dangerously hardcoded secret',
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  store: sessionStore
}));

//app.use(serveStatic(`${process.cwd()}/mock-catalog`, {index: false}));

app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);

app.use('/api/*', shopify.validateAuthenticatedSession());

app.use('/*', addSessionShopToReqParams);

app.use(express.json());
app.use('/api', apiRouters);
app.use('/oidc', oidcRouter);

app.use(serveStatic(STATIC_PATH, {index: false}));

app.use('/*', shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set('Content-Type', 'text/html')
    .send(readFileSync(join(STATIC_PATH, 'index.html')));
});

app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({
    webhookHandlers: GDPRWebhookHandlers
  })
);

app.use((err, _req, res, _next) => {
  console.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  return res.status(500).json({
    message: err.message,
    stack: err.stack
  });
});


export default app;