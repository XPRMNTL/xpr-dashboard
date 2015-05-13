(function() {
  'use strict';

  /**
   * Module Dependencies
   */
  var AppModel = require('xpr-dash-mongodb').app;

  module.exports = function(app, base) {

    base = base || '/';

    app.put(route('/:experimentId'), function(req, res, next) {
      var id = req.params.experimentId
        , data = req.body;

      AppModel.updateExperiment(id, {
          'experiments.$.value': data.value,
          'experiments.$.references': data.references,
          'experiments.$.date_modified': new Date(),
        })
        .then(function(app) {
          res.send(app.getExperiment(id));
          process.nextTick(app.serialize.bind(app));
        })
        .catch(function(err) {
          if (err instanceof Error) return next(err);

          return res.send(err);
        });
    });

    app.delete(route('/:experimentId'), function(req, res, next) {
      var id = req.params.experimentId;

      AppModel.deleteExperiment(id)
        .then(function(app) {
          res.send(204);
          process.nextTick(app.serialize.bind(app));
        })
        .catch(next);
    });

    function route(path) {
      return base + (path || '');
    }
  };

})();
