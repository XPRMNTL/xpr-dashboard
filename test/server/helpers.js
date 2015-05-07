'use strict';

/**
 * Module Dependencies
 */
var AppModel = require('xpr-dash-mongodb').app
  , Promise = Promise || require('bluebird');

exports.createApps = function (data, cb) {
  function maker(config) {
    return new Promise(function(resolve, reject) {
      var doc = new AppModel(config);

      doc.serialize(function(err) {
        if (err) return reject(err);
        resolve(doc);
      });
    });
  }

  Promise.all(data.map(maker))
    .then(function(docs) {
      cb(null, docs);
    }, function(err) {
      cb(err);
    });
};

exports.deleteApps = function (apps, cb) {
  Promise.all(apps.map(function(item) {
    return new Promise(function(resolve, reject) {
      item.remove(function() {
        resolve();
      });
    });
  })).then(function() {
    cb();
  });
};
