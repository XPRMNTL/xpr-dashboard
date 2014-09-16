(function() {
  'use strict';

  /**
   * Module Dependencies
   */
  var debug = require('debug')('feature:api:experiment');

  /**
   * Local Dependencies
   */
  var AppModel = require('../../models/app');

  module.exports = function(app, base) {

    base = base || '/';

    app.put(route('/:experimentId'), function(req, res, next) {
      var id = req.params.experimentId
        , data = req.body;

      AppModel
        .findOneAndUpdate(
          {'experiments._id': id },
          {
            $set: {
              'experiments.$.value': data.value,
              'experiments.$.references': data.references,
              'experiments.$.date_modified': new Date(),
            }
          },
          { new: true }
        )
        // .findOne({ 'experiments._id': id })
        .exec(function(err, doc) {

          if (err) {
            console.error(err);
            debug('App update error: ', err);
            return next(err);
          }

          // This is a PUT. This should already exist
          if (! doc) {
            debug('Exp (update) not found!');
            return res.send(404);
          }

          res.send(doc.experiments.id(id));
        });
    });

    // app.put(route('/hack/:appId'), hackit);


    function route(path) {
      return base + (path || '');
    }
  };

  function hackit(req, res, next) {
      var appId = req.params.appId
        , expData = req.body;

      console.info(expData);

      AppModel
        .findOne({ '_id' : appId })
        .exec(function(err, doc) {
          console.info(doc);
          // return res.send(418);
          if (err) {
            console.error(err);
            debug('App fetch error: ', err);
            return next(err);
          }

          // This is a PUT. This should already exist
          if (! doc) {
            debug('Save attempt on deleted App');
            return res.send(410);
          }

          doc.experiments.push(expData);
          doc.save(function(err, doc) {
            console.info(arguments);
            return res.send(doc);
          });

        });
    }

})();
