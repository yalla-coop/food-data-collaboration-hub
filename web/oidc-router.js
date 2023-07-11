import {Router} from 'express';

const oidcRouter = Router();

import passport from 'passport'
import OpenIDConnectStrategy from 'passport-openidconnect'
import config from './config.js'

console.log('config.OIDC_CLIENT_ID', config.OIDC_CLIENT_ID)
console.log('config.OIDC_CLIENT_SECRET', config.OIDC_CLIENT_SECRET)

passport.use(new OpenIDConnectStrategy({
  issuer: 'https://login.lescommuns.org/auth/realms/data-food-consortium',
  authorizationURL: 'https://login.lescommuns.org/auth/realms/data-food-consortium/protocol/openid-connect/auth',
  tokenURL: 'https://login.lescommuns.org/auth/realms/data-food-consortium/protocol/openid-connect/token',
  userInfoURL: 'https://login.lescommuns.org/auth/realms/data-food-consortium/protocol/openid-connect/userinfo',
  clientID: config.OIDC_CLIENT_ID,
  clientSecret: config.OIDC_CLIENT_SECRET,
  callbackURL: 'https://remaininlight.eu.ngrok.io/ofn/callback'
  //scope: [ 'profile' ]
}, function verify(issuer, profile, cb) {
  return cb(null, profile);
}));

passport.serializeUser(function(user, cb) {
  console.log('Passport serializeUser user', user)
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username, name: user.displayName });
  });
});

passport.deserializeUser(function(user, cb) {
  console.log('Passport deserializeUser user', user)
  process.nextTick(function() {
    return cb(null, user);
  });
});

app.get('/ofn/login', passport.authenticate('openidconnect'));

app.get('/ofn/oauth2/redirect', passport.authenticate('openidconnect', {
  successReturnToOrRedirect: 'http://localhost:3001/',
  failureRedirect: '/login'
}));

//app.get('/ofn/oidc/callback', function(req, res, next) {
//  console.log('/oidc/callback req', req)
//});

app.post('/ofn/logout', function(req, res, next) {
  req.logout()
  res.redirect('/ofn')
});

export default oidcRouter;