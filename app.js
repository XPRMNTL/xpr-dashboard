(function() {
  'use strict';

  /**
   * Local Dependencies
   */
  var stack = require('./lib/stack')
    , GithubAPI = require('./lib/utils/githubAPI');

  /**
   * Local Vars
   */
  var app = module.exports = stack
    , port = process.env.PORT || 5000
    , authGithubOrgs = process.env.GITHUB_ORGS.split(',');

  // Initialize Database Connections
  // only if we're not in test mode
  if (process.env.NODE_ENV !== 'test') {
    require('./lib/utils/db');
  }

  GithubAPI.prototype.orgs = authGithubOrgs;

  /* Start ze app */
  app.listen(port, function() {
    console.info('App ready on port ' + port);
  });

})();
