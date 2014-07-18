(function() {
  'use strict';

  /**
   * Module Dependencies
   */
  var debug = require('debug')('feature:api:github');

  /**
   * Local Dependencies
   */
  var GithubAPI = require('../../utils/githubAPI')
    , redis = require('../../utils/redisClient');

  module.exports = function(app, base) {
    base = base || '/';

    app.useBefore('router', route(), function initializeGithub(req, res, next) {
      req.github = new GithubAPI(req.user.profile.username, req.user.accessToken);
      console.info('Github base configured. sup?');
      next();
    });

    app.get(route('/apps'), function(req, res, next) {

      if (typeof req.query.refresh !== 'undefined') return fetch();

      redis.get('githubRepos', function(err, reply) {
        if (! reply) return fetch();

        debug('Retrieving cached repos');

        try {
          var repos = JSON.parse(reply);
        } catch (e) {
          debug('repo parse failed');
          return fetch();
        }

        redis.get('githubRepos:time', function(err, time) {
          debug('Fetched: ' + time);
          send(repos, time);
        });
      });

      function send(repos, time) {
        if (time) res.set('x-created-time', time);

        res.json(repos);
      }

      function fetch() {
        debug('Fetching new repos');
        // Get all -eng & -webdev apps
        req.github
          .fetchRepos()
          .then(function(repos) {
            var time = new Date().toString();
            redis.set('githubRepos', JSON.stringify(repos));
            redis.set('githubRepos:time', time);
            send(repos, time);
          })
          .catch(function(err) {
            next(err);
          });
      }

    });

    function route(path) {
      return base + (path || '');
    }
  };
})();
