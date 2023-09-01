import { Router } from 'express';

const oidcRouter = Router();

import session from 'express-session';
import passport from 'passport';
import OpenIDConnectStrategy from 'passport-openidconnect';
import connectSQLite from 'connect-sqlite3';

const SQLiteStore = connectSQLite(session);
const sessionStore = new SQLiteStore({
  db: 'sessions.sqlite',
  dir: '.',
  concurrentDB: true
});

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
      clientID: process.env.OIDC_CLIENT_ID,
      clientSecret: process.env.OIDC_CLIENT_SECRET,
      callbackURL: 'https://remaininlight.eu.ngrok.io/ofn/callback'
      //scope: [ 'profile' ]
    },
    function verify(issuer, profile, cb) {
      console.log('Passport verify issuer, profile', issuer, profile);
      return cb(null, profile);
    }
  )
);

passport.serializeUser(function (user, cb) {
  console.log('Passport serializeUser user', user);
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username, name: user.displayName });
  });
});

passport.deserializeUser(function (user, cb) {
  console.log('Passport deserializeUser user', user);
  process.nextTick(function () {
    return cb(null, user);
  });
});

oidcRouter.get('/login', passport.authenticate('openidconnect'));

oidcRouter.get(
  '/oauth2/redirect',
  passport.authenticate('openidconnect', {
    successReturnToOrRedirect: 'http://localhost:3001/',
    failureRedirect: '/login'
  })
);

oidcRouter.post('/logout', function (req, res, next) {
  req.logout();
  res.redirect('/ofn');
});

//oidcRouter.use('/*', session({
//  secret: 'keyboard cat',
//  resave: false, // don't save session if unmodified
//  saveUninitialized: false, // don't create session until something stored
//  store: sessionStore
//}));

export { sessionStore, oidcRouter };
