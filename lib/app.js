
'use strict';

/**
 * Local Dependencies
 */
import stack from './stack';
import GithubAPI from './utils/githubAPI';
import './config';

export default stack;

/**
 * Local Vars
 */
const app = stack;
const port = process.env.PORT || 5000;
const authGithubOrgs = process.env.GITHUB_ORGS.split(',').map((item) => {
  return item.toLowerCase();
});

GithubAPI.prototype.orgs = authGithubOrgs;

/* Start ze app */
app.listen(port, () => {
  console.info('App ready on port ' + port);
});
