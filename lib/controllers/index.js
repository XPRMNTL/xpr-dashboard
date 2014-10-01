(function() {
  'use strict';

  var orgs = process.env.GITHUB_ORGS
    , loginOrgs = orgs.split(',');

  module.exports = function(app) {

    app.useAfter('router', '/', 'ngRoutes', function(req, res, next) {
      // If this is an API call, next() it
      if (req.headers.accept.indexOf('application/json') === 0) return next();

      res.locals.baseUrl = app.get('baseUrl');

      if (! req.user) return res.render('login', { orgs: loginOrgs.join(', ')});

      return res.render('ngApp');
    });

  };

})();
