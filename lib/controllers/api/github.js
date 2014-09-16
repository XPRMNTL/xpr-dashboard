(function() {
  'use strict';

  // FIXME: DO NOT CACHE RESULTS. EVERYONE HAS DIFFERENT ACCESS-LEVELS
  // Local storage would be a good solution

  /**
   * Module Dependencies
   */
  var debug = require('debug')('feature:api:github');

  /**
   * Local Dependencies
   */
  var GithubAPI = require('../../utils/githubAPI');

  module.exports = function(app, base) {
    base = base || '/';

    app.useBefore('router', route(), function initializeGithub(req, res, next) {
      req.github = new GithubAPI(req.user.profile.username, req.user.accessToken);
      debug('Github base configured. sup?');
      next();
    });

    app.get(route('/apps'), function(req, res, next) {

      debug('Fetching new repos');
      // Get all -eng & -webdev apps
      req.github
        .fetchRepos()
        .then(function(repos) {
          var time = new Date().toString();
          res.json(repos);
        })
        .catch(function(err) {
          next(err);
        });

    });

    function route(path) {
      return base + (path || '');
    }
  };
})();
