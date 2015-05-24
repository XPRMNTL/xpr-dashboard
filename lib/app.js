
'use strict';

/**
 * Local Dependencies
 */
import stack from './stack';
import GithubAPI from './utils/githubAPI';
import { init as dbInit } from 'xpr-dash-mongodb';

export default stack;

/**
 * Local Vars
 */
const app = stack;
const port = process.env.PORT || 5000;
const authGithubOrgs = process.env.GITHUB_ORGS.split(',').map((item) => {
  return item.toLowerCase();
});

// Initialize Database Connections
// only if we're not in test mode
if (process.env.NODE_ENV !== 'test') {
  dbInit(process.env.MONGOHQ_URL);
}

GithubAPI.prototype.orgs = authGithubOrgs;

/* Start ze app */
app.listen(port, () => {
  console.info('App ready on port ' + port);
});
