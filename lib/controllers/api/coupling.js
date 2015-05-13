(function() {
  'use strict';

  /**
   * Module Dependencies
   */
  var debug = require('debug')('feature:api:coupling')
    , experimentValidator = require('xpr-util-validation').experimentValidator
    , models = require('xpr-dash-mongodb')
    , Promise = Promise || require('bluebird');

  /**
   * Local Dependencies
   */
  var AppModel = models.napp;

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

    Promise.all(promises).then(function(results) {
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
    return AppModel.findOne(fetcher)
      .then(function(app) {
        return checkChanges(app, fetcher, expList);
      })
      .catch(function(err) {
        console.info('count#xprmntl.lookup.fail=1 error="' + err.message + '"');
        throw err;
      });
  }

  function checkChanges(app, fetcher, expList) {
    return new Promise(function(resolve, reject) {
      if (! expList) {
        return resolve(app.getSerialized());
      }

      var dbExpList = app.getExperimentsObj();

      var newExpList = getNewExperiments(expList, dbExpList)
        , modifiedExpDescList = getModifiedDescriptions(expList, dbExpList)
        , edited = isEdited(modifiedExpDescList, newExpList);

      /* If there are new experiments or modified descriptions, then update the database and return the experiments with
         these updates.  Otherwise, just return the experiments from the database. */
      if (edited) {
        addNewExperiments(newExpList, app);
        updateDescriptions(modifiedExpDescList, app);

        return process.nextTick(function() {
          app.serialize()
            .then(function() {
              resolve(app.getSerialized());
            })
            .catch(function(err) {
              console.info('count#xprmntl.resave.fail=1 error="' + err.message + '" fetcher="' + JSON.stringify(fetcher) + '"');
              reject(err);
            });
        });
      }

      return resolve(app.getSerialized());
    });
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
  function addNewExperiments(newExpList, app) {
    newExpList.map(function (item) {

      /* The model sets the experiment value to false by default, so only worry about setting it if
       * the feature service is configured to allow apps to set the default for new experiments. */
      var defaultVal = allowNewExpDefault() && item.default;

      app.createExperiment(item, defaultVal);
    });
  }

  /**
   * Update the document with the modified experiment descriptions.
   *
   * @param modifiedExpDescList
   * @param doc
   */
  function updateDescriptions(modifiedExpDescList, app) {
    modifiedExpDescList.map(function (item) {
      var exp = app.getExperiment(item.id);

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
  function isEdited(modifiedExpDescList, newExpList) {
    var edited = false;

    if (modifiedExpDescList.length > 0) {
      edited = true;
      debug('New Descriptions: ', modifiedExpDescList);
    }

    if (newExpList.length > 0) {
      edited = true;
      debug('NewList: ', newExpList);
    }

    // No longer checks to see if the app document has the _serialized object

    return edited;
  }
})();
