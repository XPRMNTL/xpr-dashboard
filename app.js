(function() {
  'use strict';

  /**
   * Local Dependencies
   */
  var stack = require('./lib/stack');

  /**
   * Local Vars
   */
  var app = module.exports = stack
    , port = process.env.PORT || 5000;

  /* Start ze app */
  app.listen(port, function() {
    console.info('App ready on port ' + port);
  });

})();
