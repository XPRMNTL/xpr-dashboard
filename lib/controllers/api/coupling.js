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
        , refFlag = req.body.reference
        , promises = [];

      if (! devKey) return res.send(401);

      promises[0] = announceAndUpdate({ dev_key: devKey }, expList, refFlag);

      if (shared) {
        promises[1] = announceAndUpdate({ github_repo: shared.repo }, shared.experiments, refFlag);

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

  function announceAndUpdate(fetcher, expList, refFlag) {
    var dfd = Q.defer();

    AppModel.findOne(fetcher)
      .exec(function(err, doc) {
        if (err) {
          debug('App lookup err: ', err);
          return dfd.reject(err);
        }
        if (! doc) return dfd.reject(401);

        var oldObj = {}
          , descriptionList = [];

        doc.experiments.map(function(item) {
          oldObj[item.name] = item;
          return item.name;
        });

        var newList = expList.filter(function(item) {
            var curr = oldObj[item.name];
            if (! curr) return true;

            if (item.description && item.description !== curr.description) {
              descriptionList.push({ id: curr._id, description: item.description });
            }

            return false;
          });

        var edited = false;

        if (descriptionList.length) debug('New Descriptions: ', descriptionList);
        if (newList.length) debug('NewList: ', newList);

        newList.map(function(item) {
          var exp = new ExpModel(item);
          if (item.default) exp.value = item.default;
          doc.experiments.push(exp);
          edited = true;
        });

        descriptionList.map(function(item) {
          var exp = doc.experiments.id(item.id);

          exp.description = item.description;
          edited = true;
        });

        if (! edited) {
          doc.refFlag = refFlag;
          return dfd.resolve(doc.serialized);
        }

        doc.save(function(err, doc) {
          if (err) {
            debug('Resave err:', err, fetcher);
            return dfd.reject(err);
          }
          doc.refFlag = refFlag;
          return dfd.resolve(doc.serialized);
        });

      });

    return dfd.promise;
  }

})();
