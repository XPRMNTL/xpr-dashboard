(function() {
  'use strict';

  /**
   * Module Dependencies
   */
  var debug = require('debug')('feature:api:coupling')
    , Q = require('q');

  /**
   * Local Dependencies
   */
  var AppModel = require('../../models/app')
    , ExpModel = require('../../models/experiment');

  module.exports = function(app, base) {

    base = base || '/';

    app.get(route('/'), function(req, res, next) {
      var devKey = req.headers['x-feature-key'];

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
        , expList = req.body.experiments
        , shared = req.body.shared
        , promises = [];

      if (! devKey) return res.send(401);

      promises[0] = announceAndUpdate({ dev_key: devKey }, expList);

      if (shared) {
        promises[1] = announceAndUpdate({ github_repo: shared.repo }, shared.experiments);

      }

      Q.all(promises).then(function(results) {
        var data = {};
        data.app = results[0];

        if (results[1]) data.shared = results[1];

        return res.json(data);
      }, function (err) {
        if (err instanceof Error) return next(err);

        return res.send(err);
      });
    });

    function route(path) {
      return base + (path || '');
    }
  };

  function announceAndUpdate(fetcher, expList) {
    var dfd = Q.defer();

    AppModel.findOne(fetcher)
      .exec(function(err, doc) {
        if (err) {
          debug('App lookup err: ', err);
          return dfd.reject(err);
        }
        if (! doc) return dfd.reject(401);

        var oldList = doc.experiments.map(function(item) {
            return item.name;
          })
          , newList = expList.filter(function(item) {
            return (!~oldList.indexOf(item.name));
          });

        if (newList.length) debug('NewList: ', newList);
        if (! newList.length) return dfd.resolve(doc.serialized);

        newList.map(function(item) {
          var exp = new ExpModel(item);
          if (item.default) exp.value = item.default;
          doc.experiments.push(exp);
        });

        doc.save(function(err, doc) {
          if (err) {
            debug('Resave err:', err, fetcher);
            return dfd.reject(err);
          }
          return dfd.resolve(doc.serialized);
        });

      });

    return dfd.promise;
  }

})();
