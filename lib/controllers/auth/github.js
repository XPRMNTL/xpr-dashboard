(function() {
  'use strict';

  /**
   * Module Dependencies
   */
  var passport = require('passport')
    , GithubStrategy = require('passport-github').Strategy;

  /**
   * Local dependencies
   */
  var GithubAPI = require('../../githubAPI');

  /**
   * Local Vars
   */
  var githubConfig = {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackUrl: process.env.BASE_URL + '/auth/github/callback'
    };

  module.exports = function(app) {
    passport.use('github', new GithubStrategy(githubConfig, function(accessToken, refreshToken, profile, done) {
      process.nextTick(function () {
        return done(null, {
          'accessToken': accessToken,
          'refreshToken': refreshToken,
          'profile': profile
        });
      });
    }));

    app.get('/auth/github', passport.authenticate('github', { scope: 'read:org, repo' }));

    app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), function(req, res) {
      // If not logged in at all, go there.
      if (! (req.user && req.user.profile && req.user.profile.username && req.user.accessToken)) return res.redirect('/auth/github');

      var github = new GithubAPI(req.user.profile.username, req.user.accessToken);

      github.fetchOrgs()
        .then(github.filterOrgs.bind(github))
        .then(function() {
          // Great. Got our teams
          return res.redirect('/');
        })
        .catch(function(err) {
          console.error(err);
          // You're not one in these teams
          req.logout();
          res.clearCookie('accessToken');
          return res.redirect('/?unauthorized');
        });
    });
  };

})();
