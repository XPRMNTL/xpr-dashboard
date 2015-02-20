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

    app.get(route('/'), couplingHandler);
    app.post(route('/'), couplingHandler);

    function route(path) {
      return (base || '/') + (path || '');
    }
  };

  function couplingHandler(req, res, next) {
    var devKey = req.headers['x-feature-key']
      , devKeyShared = req.headers['x-feature-key-shared']
      , expList = req.body.experiments
      , shared = req.body.shared
      , promises = [];

    if (! devKey) return res.send(401);

    promises[0] = announceAndUpdate({ dev_key: devKey }, expList);

    if (devKeyShared) {
      if (! shared) shared = {};
      promises[1] = announceAndUpdate({ dev_key: devKeyShared }, shared.experiments);
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
  }

  function announceAndUpdate(fetcher, expList) {
    var dfd = Q.defer();

    AppModel.findOne(fetcher)
      .exec(function(err, doc) {
        if (err) {
          console.info('count#xprmntl.lookup.fail=1 error="' + err.message + '"');
          return dfd.reject(err);
        }

        if (! doc) return dfd.reject(401);
        if (! expList) return dfd.resolve(doc.serialized);

        var oldObj = {}
          , descriptionList = [];

        doc.experiments.map(function(item) {
          oldObj[item.name] = item;
          return item.name;
        });

        var newList = expList.filter(function(item) {
            var curr = oldObj[item.name];
            if (! curr) {
              if (!isValidExperiment(item)) {
                debug('Invalid experiment not added: ', item);
                return false;
              }
              return true;
            }

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

        if (! edited) return dfd.resolve(doc.serialized);

        process.nextTick(function() {
          doc
            .serialize()
            .then(function(_doc) {
              return dfd.resolve(_doc.serialized);
            }, function(err) {
              console.info('count#xprmntl.resave.fail=1 error="' + err.message + '" fetcher="' + JSON.stringify(fetcher) + '"');
              return dfd.reject(err);
            });
        });

      });

    return dfd.promise;
  }

  /**
   * Checks if the experiment is valid.
   * @param experiment
   */
  function isValidExperiment(experiment) {
    var valid = false;
    /* Experiment must have a name and the name cannot contain whitespace chars (space, newline, tab, etc) */
    if (experiment && experiment.name && !experiment.name.match(/\s/g)) {
      valid = true;
    }

    return valid;
  }
})();
