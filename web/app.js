/* eslint-disable no-param-reassign */
/* eslint-disable prefer-arrow-callback */
// @ts-nocheck
import axios from 'axios';
import * as dotenv from 'dotenv';
import { join } from 'path';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

import cron from 'node-cron';

import cookieParser from 'cookie-parser';

import session from 'express-session';
import passport from 'passport';
import { Issuer, Strategy } from 'openid-client'
import connectSQLite from 'connect-sqlite3';

import { readFileSync } from 'fs';
import express from 'express';
import serveStatic from 'serve-static';

import apiRouters from './modules/api-routers.js';
import { oidcRouter } from './oidc-router.js';

import shopify from './shopify.js';
import webhookHandlers from './webhooks/webhooks-handlers.js';
import isAuthenticated from './middleware/isAuthenticated.js';
import {
  createSalesSessionCronJob,
  updateExistingProductsCronJob
} from './modules/cron-jobs/index.js';
import subscribeToWebhook from './utils/subscribe-to-webhook.js';

if (process.env.NODE_ENV === 'development') {
  dotenv.config({
    path: join(process.cwd(), '.env.test')
  });
} else {
  dotenv.config({
    path: join(process.cwd(), '.env')
  });
}

const STATIC_PATH =
  process.env.NODE_ENV === 'production'
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

async function createApp() {

  const app = express();

  Sentry.init({
    dsn: process.env.SENTRY_DNS,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }), // enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app }),
      new ProfilingIntegration()
    ],
    enabled: process.env.NODE_ENV === 'production', // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0 // Capture 100% of the transactions, reduce in production!
  });

  // The request handler must be the first middleware on the app
  app.use(Sentry.Handlers.requestHandler());

  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());

  app.post(
    shopify.config.webhooks.path,
    shopify.processWebhooks({
      webhookHandlers
    })
  );

  const SQLiteStore = connectSQLite(session);

  const sessionStore = new SQLiteStore({
    db: 'sessions.sqlite',
    dir: '.', // @ts-ignore
    concurrentDB: true
  });

  const sessionObject = {
    secret: process.env.SESSION_SIGNING_KEY,
    resave: false, // don't save session if unmodified
    saveUninitialized: false,
    store: sessionStore
  };

  app.use(
    '/', // @ts-ignore
    session({
      ...sessionObject,
      proxy: true,
      cookie: {
        secure: true, // Set to true if you're using HTTPS
        httpOnly: true, // Ensures the cookie is only accessible via HTTP/HTTPS
        maxAge: 1000 * 60 * 60 * 24 * 7, // Sets cookie to expire in 7 days,
        sameSite: 'none' // Can be 'strict', 'lax', 'none', or boolean (true)
      }
    })
  );

  const issuer = await Issuer.discover(process.env.OIDC_DISCOVERY_URL);

  const client = new issuer.Client({
    client_id: process.env.OIDC_CLIENT_ID,
    client_secret: process.env.OIDC_CLIENT_SECRET,
    respose_types: ['code'],
    redirect_uris: [process.env.OIDC_CALLBACK_URL],
  });

  app.use(cookieParser());
  passport.use(
    new Strategy({
      client: client,
      passReqToCallback: true,
      usePKCE: true,
      // sessionKey: process.env.OIDC_SESSION_KEY,
    },
      function authCallback(
        tokenset, userinfo, done
      ) {
        // profile.accessToken = accessToken;
        // profile.refreshToken = refreshToken;
        // profile.idToken = idToken;
        console.log('tokenSet', tokenSet);
        console.log('userinfo', userinfo);
        console.log('done', done);
        return done(null, userinfo);
      }
    )
  );

  passport.serializeUser(function serializeUserFunction(user, cb) {
    return cb(null, {
      id: user.id,
      username: user.username,
      name: user.displayName,
      email: user.emails[0].value,
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
      idToken: user.idToken
    });
  });
  passport.deserializeUser(function deserializeUserFunction(user, cb) {
    return cb(null, user);
  });

  app.use('/*', passport.initialize());
  app.use('/*', passport.session());

  app.get(shopify.config.auth.path, shopify.auth.begin());

  // This is the best place to subscribe for the webhooks.
  app.get(
    shopify.config.auth.callbackPath,
    shopify.auth.callback(), // @ts-ignore
    async (req, res, next) => {
      try {
        await Promise.allSettled([
          [
            'products/delete',
            'orders/paid',
            'orders/cancelled',
            'carts/create',
            'carts/update',
            'checkouts/create',
            'checkouts/update',
            'products/update'
          ].map(async (topic) => {
            await subscribeToWebhook({
              session: res.locals.shopify.session,
              HOST: process.env.HOST,
              topic,
              shopify
            });
          })
        ]);

        return next();
      } catch (err) {
        return next(err);
      }
    },
    shopify.redirectToShopifyOrAppRoot()
  );

  app.use('/api/*', shopify.validateAuthenticatedSession());

  app.post('/api/user/logout', isAuthenticated, async (req, res) => {
    const url = process.env.OIDC_LOGOUT_URL;

    const queryParams = new URLSearchParams({
      id_token_hint: req.user.idToken,
      post_logout_redirect_uri: `${process.env.HOST}oidc/logout`
    });

    try {
      await axios.get(`${url}?${queryParams}`);
    } catch (e) {
      console.log(e.message);
    }

    res.redirect('/');
  });

  app.get('/api/user/check', isAuthenticated, (req, res) =>
    res.json({
      success: true,
      user: req.user,
      isAuthenticated: true
    })
  );

  app.use('/api', express.json(), isAuthenticated, apiRouters);

  app.use(express.json());
  app.use('/oidc', oidcRouter);

  app.use(serveStatic(STATIC_PATH, { index: false }));

  app.use('/*', shopify.ensureInstalledOnShop(), async (_req, res) =>
    res
      .status(200)
      .set('Content-Type', 'text/html')
      .send(readFileSync(join(STATIC_PATH, 'index.html')))
  );

  cron.schedule('* * * * *', async () => {
    await updateExistingProductsCronJob();
    await createSalesSessionCronJob();
  });

  // The error handler must be registered before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler());

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    const errorStatus = err.status || 500;

    return res.status(errorStatus).json({
      message: err.response?.data?.message || err.message,
      stack: err.stack
    });
  });
  return app;
}


export default createApp;
