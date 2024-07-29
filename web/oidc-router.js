/* eslint-disable function-paren-newline */
import { Router } from 'express';
import passport from 'passport';
import { readFileSync } from 'fs';
import { join } from 'path';

import { createOrUpdate } from './database/users/users.js';

const STATIC_PATH = `${process.cwd()}/frontend/`;

const oidcRouter = Router();

oidcRouter.get('/login', passport.authenticate('login.lescommuns.org'));

oidcRouter.get('/success', async (req, res) => {
  console.log('User logged in', JSON.stringify(req.user));
  await createOrUpdate(req.user);
  res
    .status(200)
    .set('Content-Type', 'text/html')
    .send(readFileSync(join(STATIC_PATH, 'success.html')));
});

oidcRouter.get(
  '/callback',
  (req, res, next) => {
    const { state } = req.query;
    req.session['openidconnect:login.lescommuns.org'] = {
      state: { handle: state }
    };
    next();
  },

  passport.authenticate('login.lescommuns.org', {
    successRedirect: `/oidc/success?${new Date().getTime()}`,
    failureRedirect: `/oidc/failure?${new Date().getTime()}`,
    failureMessage: true
  })
);

export { oidcRouter };
