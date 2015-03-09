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

    AppModel.findOne(fetcher).exec(function(err, doc) {
      handleAnnounceAndUpdate(err, doc, fetcher, expList, dfd);
    });
    return dfd.promise;
  }

  function handleAnnounceAndUpdate(err, doc, fetcher, expList, dfd) {
    if (err) {
      console.info('count#xprmntl.lookup.fail=1 error="' + err.message + '"');
      return dfd.reject(err);
    }

    if (! doc) return dfd.reject(401);
    if (! expList) return dfd.resolve(serializeAndClean(doc));

    var dbExpList = {};
    doc.experiments.map(function(item) {
      dbExpList[item.name] = item;
      return item.name;
    });

    var newExpList = getNewExperiments(expList, dbExpList)
      , modifiedExpDescList = getModifiedDescriptions(expList, dbExpList)
      , edited = isEdited(modifiedExpDescList, newExpList, doc);

    /* If there are new experiments or modified descriptions, then update the database and return the experiments with
       these updates.  Otherwise, just return the experiments from the database. */
    if (edited) {
      addNewExperiments(newExpList, doc);
      updateDescriptions(modifiedExpDescList, doc);

      return process.nextTick(function() {
        doc.serialize()
          .then(function (_doc) {
            return dfd.resolve(serializeAndClean(_doc));
          }, function (err) {
            console.info('count#xprmntl.resave.fail=1 error="' + err.message + '" fetcher="' + JSON.stringify(fetcher) + '"');
            return dfd.reject(err);
          });
      });
    }

    return dfd.resolve(serializeAndClean(doc));
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

  /**
   * Create the list of new experiments.
   *
   * @param expList
   * @param origExpList
   * @returns {Array}
   */
  function getNewExperiments(expList, origExpList) {
    return  expList.filter(function (experiment) {
      var existingExperiment = origExpList[experiment.name];
      /* Skip existing and invalid experiments. */
      if (!existingExperiment) {
        if (experimentValidator.isValid(experiment)) {
          return true;
        }
        console.warn('Invalid experiment not added: %s', JSON.stringify(experiment));
      }
      return false;
    });
  }

  /**
   * Create list of modified experiment descriptions.
   *
   * @param expList
   * @param origExpList
   * @returns {Array}
   */
  function getModifiedDescriptions(expList, origExpList) {
    var modifiedDescriptions = [];
    expList.filter(function (experiment) {
      var existingExperiment = origExpList[experiment.name];
      if (existingExperiment && experiment.description && experiment.description !== existingExperiment.description) {
        modifiedDescriptions.push({id: existingExperiment._id, description: experiment.description});
      }
    });
    return modifiedDescriptions;
  }

  /**
   * Create new models for each of the new experiments and add them to the document.
   *
   * @param newExpList
   * @param doc
   */
  function addNewExperiments(newExpList, doc) {
    newExpList.map(function (item) {
      var exp = new ExpModel(item);

      /* The model sets the experiment value to false by default, so only worry about setting it if
       * the feature service is configured to allow apps to set the default for new experiments. */
      if (allowNewExpDefault() && item.default) {
        exp.value = item.default;
      }

      doc.experiments.push(exp);
    });
  }

  /**
   * Update the document with the modified experiment descriptions.
   *
   * @param modifiedExpDescList
   * @param doc
   */
  function updateDescriptions(modifiedExpDescList, doc) {
    modifiedExpDescList.map(function (item) {
      var exp = doc.experiments.id(item.id);
      exp.description = item.description;
    });
  }

  /**
   * Checks if the app document has changed.  Returning true will cause the document to be
   * updated in the Database.
   *
   * @param modifiedExpDescList
   * @param newExpList
   * @returns {boolean}
   */
  function isEdited(modifiedExpDescList, newExpList, doc) {
    var edited = false;

    if (modifiedExpDescList.length > 0) {
      edited = true;
      debug('New Descriptions: ', modifiedExpDescList);
    }

    if (newExpList.length > 0) {
      edited = true;
      debug('NewList: ', newExpList);
    }

    /* Apps created or last updated with Feature v0.8.1 and prior do not have the _serialized field, which is required
       as of v0.9.0. So, if the _serialized field does not exist for an app, then automatically migrate the app data
       by forcing the document to be rewritten to the DB which will cause the _serialized field to be added. */
    if (!doc._serialized) {
      edited = true;
    }

    return edited;
  }
})();
