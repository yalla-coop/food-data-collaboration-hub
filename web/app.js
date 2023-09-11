// @ts-check

//http://localhost:55807/oidc/callback
import * as dotenv from 'dotenv';
import { join } from 'path';

import cookieParser from 'cookie-parser';

import session from 'express-session';
import passport from 'passport';
import OpenIDConnectStrategy from 'passport-openidconnect';
import connectSQLite from 'connect-sqlite3';

import { readFileSync } from 'fs';
import express from 'express';
import serveStatic from 'serve-static';
import apiRouters from './api-routers.js';
import { oidcRouter } from './oidc-router.js';
import shopify from './shopify.js';
import GDPRWebhookHandlers from './gdpr.js';
import isAuthenticated from './middleware/isAuthenticated.js';

dotenv.config({
  path: join(process.cwd(), '.env')
});

const STATIC_PATH =
  process.env.NODE_ENV === 'production'
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

const SQLiteStore = connectSQLite(session);

const sessionStore = new SQLiteStore({
  db: 'sessions.sqlite',
  dir: '.',
  concurrentDB: true
});

const sessionObject = {
  secret: process.env.OIDC_SESSION_SECRET,
  resave: false, // don't save session if unmodified
  saveUninitialized: false,
  store: sessionStore
};

app.use(
  '/',
  session({
    ...sessionObject,
    proxy: true,
    cookie: {
      secure: true, // Set to true if you're using HTTPS
      httpOnly: true, // Ensures the cookie is only accessible via HTTP/HTTPS
      maxAge: 1000 * 60 * 60 * 24 * 7, // Sets cookie to expire in 7 days
      sameSite: 'none' // Can be 'strict', 'lax', 'none', or boolean (true)
    }
  })
);

app.use(cookieParser());

passport.use(
  new OpenIDConnectStrategy(
    {
      issuer: 'https://login.lescommuns.org/auth/realms/data-food-consortium',
      authorizationURL:
        'https://login.lescommuns.org/auth/realms/data-food-consortium/protocol/openid-connect/auth',
      tokenURL:
        'https://login.lescommuns.org/auth/realms/data-food-consortium/protocol/openid-connect/token',
      userInfoURL:
        'https://login.lescommuns.org/auth/realms/data-food-consortium/protocol/openid-connect/userinfo',
      clientID: process.env.OIDC_CLIENT_ID || '',
      clientSecret: process.env.OIDC_CLIENT_SECRET || '',
      callbackURL: process.env.OIDC_CALLBACK_URL || '',
      passReqToCallback: true,
      sessionKey: 'openidconnect:login.lescommuns.org'
    },

    function (
      req,
      issure,
      profile,
      context,
      idToken,
      accessToken,
      refreshToken,
      done
    ) {
      profile.accessToken = accessToken;
      profile.refreshToken = refreshToken;
      profile.idToken = idToken;

      return done(null, profile);
    }
  )
);

passport.serializeUser(function (user, cb) {
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
passport.deserializeUser(function (user, cb) {
  return cb(null, user);
});

app.use('/*', passport.initialize());
app.use('/*', passport.session());

app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);

app.use('/api/*', shopify.validateAuthenticatedSession());

app.post('/api/user/logout', function (req, res, next) {
  return req.logout(function (err) {
    if (err) {
      return next(err);
    }

    //remove the session token from the cookie
    res.clearCookie('connect.sid');
    return res.redirect('/');
  });
});

app.get('/api/user/check', isAuthenticated, (req, res) => {
  return res.json({ success: true, user: req.user, isAuthenticated: true });
});

app.use('/api', express.json(), isAuthenticated, apiRouters);

app.use(express.json());
app.use('/oidc', oidcRouter);

app.use(serveStatic(STATIC_PATH, { index: false }));

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

export default app;
