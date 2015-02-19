(function() {
  'use strict';

  /**
   * Module Dependencies
   */
  var debug = require('debug')('feature:api:coupling')
    , Q = require('q')
    , experimentValidator = require('xpr-util-validation').experimentValidator;

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
        if (! expList) return dfd.resolve(serializeAndClean(doc));

        var oldObj = {}
          , descriptionList = [];

        doc.experiments.map(function(item) {
          oldObj[item.name] = item;
          return item.name;
        });

        var newList = expList.filter(function(item) {
            var curr = oldObj[item.name];
            if (! curr) {
              if (!experimentValidator.isValid(item)) {
                console.warn('Invalid experiment not added: %s', JSON.stringify(item));
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

          /* The model sets the experiment value to false by default, so only worry about setting it if
           * the feature service is configured to allow apps to set the default for new experiments. */
          if (allowNewExpDefault() && item.default) {
            exp.value = item.default;
          }

          doc.experiments.push(exp);
          edited = true;
        });

        descriptionList.map(function(item) {
          var exp = doc.experiments.id(item.id);

          exp.description = item.description;
          edited = true;
        });

        if (! edited) return dfd.resolve(serializeAndClean(doc));

        process.nextTick(function() {
          doc
            .serialize()
            .then(function(_doc) {
              return dfd.resolve(serializeAndClean(_doc));
            }, function(err) {
              console.info('count#xprmntl.resave.fail=1 error="' + err.message + '" fetcher="' + JSON.stringify(fetcher) + '"');
              return dfd.reject(err);
            });
      });

      });

    return dfd.promise;
  }

  /**
   * Determines if the environment variable ALLOW_NEW_EXP_DEFAULT is set to allow client apps to set the default
   * value for new experiments.
   *
   * @returns {boolean}
   */
  function allowNewExpDefault() {
    var allow = false
      , allowEnv = process.env.ALLOW_NEW_EXP_DEFAULT;

    if (allowEnv && allowEnv.toLowerCase() === 'true') {
      allow = true;
    }
    return allow;
  }

  /**
   * Serialize the document and remove any invalid experiments.
   *
   * @param doc
   * @returns {*}
   */
  function serializeAndClean(doc) {
    var docSerialized = doc.serialized;
    docSerialized.experiments = cleanExperimentsObj(docSerialized.experiments);
    return docSerialized;
  }

  /**
   * Cleans the provided experiments object by removing invalid experiments.  The cleaned experiments object is returned.
   *
   * @param experimentsObj
   * @returns {Array.<T>|*}
   */
  function cleanExperimentsObj(experimentsObj) {
    for (var key in experimentsObj) {
      if (experimentsObj.hasOwnProperty(key) && !experimentValidator.isValid({name: key})) {
        delete experimentsObj[key];
      }
    }
    return experimentsObj;
  }
})();
