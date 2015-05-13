(function() {
  'use strict';

  /**
   * Local Dependencies
   */
  var stack = require('./stack')
    , GithubAPI = require('./utils/githubAPI');

  /**
   * Local Vars
   */
  var app = module.exports = stack
    , port = process.env.PORT || 5000
    , authGithubOrgs = process.env.GITHUB_ORGS.split(',').map(function(item) {
      return item.toLowerCase();
    });

  // Initialize Database Connections
  // only if we're not in test mode
  if (process.env.NODE_ENV !== 'test') {
    require('xpr-dash-mongodb').init(process.env.MONGOHQ_URL);
  }

  GithubAPI.prototype.orgs = authGithubOrgs;

  /* Start ze app */
  app.listen(port, function() {
    console.info('App ready on port ' + port);
  });

})();
