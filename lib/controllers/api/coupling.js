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

    app.get(route('/'), function(req, res, next) {
      // THis is a test devkey I generated.
      // FIXME: take it out
      var devKey = req.headers['x-feature-key'] || 'eccba2a2-fa63-4c39-9c5c-567a76aae3a6';

      if (! devKey) return res.send(401);

      AppModel.findOne({ dev_key: devKey })
        .exec(function(err, doc) {
          if (err) {
            debug('devKey fetch error:', err);
            return next(err);
          }
          if (! doc) return res.send(401);

          res.json(doc.serialized);
        });
    });

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
