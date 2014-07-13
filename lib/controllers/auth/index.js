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
      // Continue to logging in
      if (! (req.user && req.user.profile)) return res.json({ isLoggedIn: false });

      var user = req.user.profile;
      return res.json({
        name : user.displayName,
        img : user._json.avatar_url,
        isLoggedIn: true
      });
    });

    require('./github')(app);

    app.get('/auth/logout', function(req, res) {
      debug('Logging out');
      req.logout();
      res.clearCookie('accessToken');

      res.redirect('/');
    });
  };

})();
