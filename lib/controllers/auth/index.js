(function() {
  'use strict';

  /**
   * Module Dependencies
   */
  var passport = require('passport')
    , debug = require('debug')('auth:index');

  /**
   * Local Dependencies
   */
  module.exports = function(app) {

    // I really don't want to test OAuth. It's been done already.
    if (process.env.NODE_ENV === 'test') return;

    passport.serializeUser(function(user, done) {
      done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
      done(null, obj);
    });

    app.useAfter('session', passport.initialize());
    app.useAfter('initialize', passport.session());

    app.get('/', function(req, res, next) {
      if (typeof req.query.unauthorized !== 'undefined') {
        res.locals.unauthorized = true;
        return next();
      }

      res.locals.user = req.user;
      next();
    });

    // Hit this to get the current logged-in user
    app.get('/auth/user', function(req, res) {

      function getJSON(user) {
        if (!user) return { isLoggedIn: false };

        if (user.profile) {
          user = user.profile;
          return {
            name: user.displayName,
            img: user._json.avatar_url,
            isLoggedIn: true
          }
        }

        if (user._id) {
          return {
            name: user.displayName,
            employeeID: user.employeeID,
            img: process.env.SAML_PHOTO_BASE + user.employeeID,
            isLoggedIn: true,
          };
        }

        return { isLoggedIn: false };
      }

      return res.json(getJSON(req.user));
    });

    require('./github')(app);
    require('./saml')(app);

    app.get('/auth/logout', function(req, res) {
      debug('Logging out');
      req.logout();
      res.clearCookie('accessToken');

      res.redirect('/');
    });
  };

})();
