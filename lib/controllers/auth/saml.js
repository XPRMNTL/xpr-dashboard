(function() {
  'use strict';

  /**
   * Module Dependencies
   */
  var passport = require('passport')
    , Strategy = require('passport-saml').Strategy;

  /**
   * Local Vars
   */
  var samlConfig = {
    path: '/auth/saml/callback',
    entryPoint: process.env.SAML_ENTRY_POINT,
    issuer: process.env.SAML_ISSUER,
    // cert: process.env.SAML_CERT
  };

  module.exports = function(app) {
    passport.use('saml', new Strategy(samlConfig, verifier));

    app.get('/auth/saml', passport.authenticate('saml'));

    app.post('/auth/saml/callback', passport.authenticate('saml', { failureRedirect: '/' }), function(req, res) {
      // If not logged in at all, go there.
      if (!(req.user && req.user._id && req.user.employeeID)) return res.redirect('/?unauthorized');

      return res.redirect('/');
    });
  };

  function verifier(user, next) {
    var id = user.employeeID;

    return next(null, user)
  }

})();
