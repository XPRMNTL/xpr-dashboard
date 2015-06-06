'use strict';

/**
 * Module Dependencies
 */
import debugLib from 'debug';
import { Router } from 'jack-stack';

/**
 * Local Dependencies
 */
import { app as AppModel } from '../../config';
import GithubAPI from '../../utils/githubAPI';

/**
 * Local Constants
 */
const debug = debugLib('xpr:api:github');
const router = Router();

export default router;

router.get('/apps', (req, res, next) => {
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
