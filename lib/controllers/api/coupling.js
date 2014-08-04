(function() {
  'use strict';

  /**
   * Module Dependencies
   */
  var debug = require('debug')('feature:api:coupling');

  /**
   * Local Dependencies
   */
  var AppModel = require('../../models/app');

  module.exports = function(app, base) {

    base = base || '/';

    app.post(route('/'), function(req, res, next) {
      var devKey = req.headers['x-feature-key']
        , expList = req.body.features;

      if (! devKey) return res.send(401);

      console.log(devKey);
      console.log(expList);

      res.send(418);

    });

    function route(path) {
      return base + (path || '');
    }
  };

})();
