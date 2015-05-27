'use strict';

// FIXME: DO NOT CACHE RESULTS. EVERYONE HAS DIFFERENT ACCESS-LEVELS
// Local storage would be a good solution

/**
 * Module Dependencies
 */
import debugLib from 'debug';

/**
 * Local Dependencies
 */
import GithubAPI from '../../utils/githubAPI';

/**
 * Local Constants
 */
const debug = debugLib('xpr:api:github');

export default function(app, base) {
  base = base || '/';

  app.useBefore('router', route(), function initializeGithub(req, res, next) {
    req.github = new GithubAPI(req.user.profile.username, req.user.accessToken);
    debug('Github base configured. sup?');
    next();
  });

  app.get(route('/apps'), (req, res, next) => {

    debug('Fetching new repos');
    req.github
      .fetchRepos()
      .then((repos) => {
        res.json(repos);
      })
      .catch((err) => {
        next(err);
      });

  });

  function route(path) {
    return base + (path || '');
  }
};
