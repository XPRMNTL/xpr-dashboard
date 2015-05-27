'use strict';

/**
 * Module Dependencies
 */
import passport from 'passport';
import debugLib from 'debug';


/**
 * Local Constants
 */
const debug = debugLib('xpr:auth:index');

/**
 * Local Dependencies
 */
export default function(app) {

  // I really don't want to test OAuth. It's been done already.
  if (process.env.NODE_ENV === 'test') return;

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });

  app.useAfter('session', passport.initialize());
  app.useAfter('initialize', passport.session());

  app.get('/', (req, res, next) => {
    if (typeof req.query.unauthorized !== 'undefined') {
      res.locals.unauthorized = true;
      return next();
    }

    res.locals.user = req.user;
    next();
  });

  // Hit this to get the current logged-in user
  app.get('/auth/user', (req, res) => {
    // Continue to logging in
    if (! (req.user && req.user.profile)) return res.json({ isLoggedIn: false });

    let user = req.user.profile;
    return res.json({
      name : user.displayName,
      img : user._json.avatar_url,
      isLoggedIn: true
    });
  });

  require('./github')(app);

  app.get('/auth/logout', (req, res) => {
    debug('Logging out');
    req.logout();
    res.clearCookie('accessToken');

    res.redirect('/');
  });
}
