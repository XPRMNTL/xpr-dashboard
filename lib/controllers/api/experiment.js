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
              'experiments.$.type': data.type,
              'experiments.$.values': data.values,
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

      // AppModel
      //   .findByIdAndUpdate(id, { $addToSet: { experiments: data } }, { new: true })
      //   .exec(function(err, doc) {
      //     if (err) {
      //       console.error(err);
      //       debug('App update error: ', err);
      //       return next(err);
      //     }
      //
      //     // This is a PUT. This should already exist
      //     if (! doc) {
      //       debug('Exp (update) not found!');
      //       return res.send(404);
      //     }
      //
      //     res.send(doc);
      //     // console.log(arguments);
      //   });

      // AppModel.findById(id, function(err, app) {
      //   console.log(arguments);
      //   if (err) {
      //     console.error(err);
      //     debug('App fetch for update experiment failed: ', err);
      //     return next(err);
      //   }
      //
      //   if (! app) {
      //     debug('App fetch err: not found: ' + id);
      //     return next();
      //   }
      //
      //   console.log(app.experiments.create.toString());
      //
      //   app.experiments.push(data);
      //
      //   console.log(app);
      //
      // });









      // var appId = req.params.appId
      //   , appData = req.body
      //   , name = appData.name;
      //
      // AppModel
      //   .findOne({ '_id' : appId })
      //   .exec(function(err, doc) {
      //     if (err) {
      //       console.error(err);
      //       debug('App fetch error: ', err);
      //       return next(err);
      //     }
      //
      //     // This is a PUT. This should already exist
      //     if (! doc) {
      //       debug('Save attempt on deleted App');
      //       return res.send(410);
      //     }
      //
      //     // If they've got an old item, I don't want to
      //     // override something newer
      //     if (appData.__v !== doc.__v) {
      //       debug('Attempting to save an old document');
      //       return res.send(409, doc);
      //     }
      //
      //     // FIXME: Check for github privilege
      //     AppModel.update(
      //       { '_id' : appId },
      //       { $set: { name: name } }
      //     , function(err) {
      //       if (err) {
      //         console.error(err);
      //         debug('Update failed');
      //         return next(err);
      //       }
      //
      //       doc.name = name;
      //
      //       return res.send(doc);
      //     });
      //
      //   });
    });

    // app.put(route('/hack/:appId'), hackit);


    function route(path) {
      return base + (path || '');
    }
  };

  function hackit(req, res, next) {
      var appId = req.params.appId
        , expData = req.body;

      console.log(expData);

      AppModel
        .findOne({ '_id' : appId })
        .exec(function(err, doc) {
          console.log(doc);
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
            console.log(arguments);
            return res.send(doc);
          });

        });
    }

})();
