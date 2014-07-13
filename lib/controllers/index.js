(function() {
  'use strict';

  module.exports = function(app) {

    app.useBefore('router', '/', 'xhrChecker', function(req, res, next) {
      // If this is an API call, ignore it
      if (req.headers.accept.indexOf('application/json') === 0) return next();

      res.locals.baseUrl = app.get('baseUrl');
      if (! req.user) return res.render('login');

      return res.render('ngApp');
    });

  };

})();
