(function() {
  'use strict';

  var ROOT = '/api';

  module.exports = function(app) {

    app.useBefore('router', ROOT, 'authCheck', function(req, res, next) {
      if (! req.user) return res.send(401);
      console.info('api/');
      next();
    });

    require('./github')(app, ROOT + '/github');
    require('./app')(app, ROOT + '/app');

  };
})();
