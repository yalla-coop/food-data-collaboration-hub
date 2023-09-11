import { Router } from 'express';
import shopify from './shopify.js';
import passport from 'passport';
import { readFileSync } from 'fs';
import { join } from 'path';

const STATIC_PATH =
  process.env.NODE_ENV === 'production'
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const oidcRouter = Router();

oidcRouter.get('/login', passport.authenticate('openidconnect'));

oidcRouter.get('/success', function (req, res, next) {
  return res
    .status(200)
    .set('Content-Type', 'text/html')
    .send(readFileSync(join(STATIC_PATH, 'success.html')));
});

oidcRouter.get(
  '/callback',
  (req, res, next) => {
    const state = req.query.state;
    req.session['openidconnect:login.lescommuns.org'] = {
      state: { handle: state }
    };
    next();
  },

  passport.authenticate('openidconnect', {
    successRedirect: `/oidc/success`,
    failureRedirect: '/oidc/failure',
    failureMessage: true
  })
);

oidcRouter.get('/success', function (req, res, next) {
  return res.json({ success: true, user: req.user });
});

export { oidcRouter };
