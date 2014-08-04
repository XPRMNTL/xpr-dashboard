(function() {
  'use strict';

  /**
   * Module Dependencies
   */
  var debug = require('debug')('feature:api:app');

  /**
   * Local Dependencies
   */
  var AppModel = require('../../models/app');

  module.exports = function(app, base) {

    base = base || '/';

    app.get(route('/'), function(req, res, next) {
      var query = cleanFields(req.query);

      AppModel
        .find(query)
        .sort({
          name: 1,
          github_repo: 1,
        })
        .exec(function(err, docs) {
          if (err) {
            debug('App fetch failure: ', err);
            return next(err);
          }

          return res.send(docs);
        });
    });

    app.post(route('/'), function(req, res, next) {
      var config = cleanFields(req.body)
        , doc = new AppModel(config);

      doc.save(function(err) {
        if (err) {
          console.error(err);
          debug('App creation error: ', err);
          // 11000 means a unique index failed
          if (err.code === 11000) return res.send(409, err);
          return next(err);
        }
        debug('Created app: ', doc);
        res.json(201, doc);
      });
    });

    app.put(route('/:appId'), function(req, res, next) {
      var appId = req.params.appId
        , appData = req.body
        , name = appData.name;

      AppModel
        .findOne({ '_id' : appId })
        .exec(function(err, doc) {
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

          // If they've got an old item, I don't want to
          // override something newer
          if (appData.__v !== doc.__v) {
            debug('Attempting to save an old document');
            return res.send(409, doc);
          }

          // FIXME: Check for github privilege
          AppModel.update(
            { '_id' : appId },
            { $set: { name: name } }
          , function(err) {
            if (err) {
              console.error(err);
              debug('Update failed');
              return next(err);
            }

            return res.send(doc);
          });

        });
    });


    function route(path) {
      return base + (path || '');
    }
  };

  function cleanFields(oldObj) {
    var fieldList = [ 'github_repo' ]
      , newObj = {}
      , field;

    for (var i=0, l=fieldList.length; i<l; i++) {
      field = fieldList[i];
      if (oldObj[field]) newObj[field] = oldObj[field];
    }

    return newObj;
  }
})();
