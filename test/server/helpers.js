'use strict';

/**
 * Module Dependencies
 */
var Q = require('q');

/**
 * Local Dependencies
 */
var AppModel = require('../../lib/models/app');

exports.createApps = function (data, cb) {
  function maker(config) {
    var dfd = Q.defer();

    var doc = new AppModel(config);

    doc.serialize(function(err) {
      if (err) return dfd.reject(err);
      dfd.resolve(doc);
    });

    return dfd.promise;
  }

  Q.all(data.map(maker))
    .then(function(docs) {
      cb(null, docs);
    }, function(err) {
      cb(err);
    });
};

exports.deleteApps = function (apps, cb) {
  Q.all(apps.map(function(item) {
    var dfd = Q.defer();
    item.remove(function() {
      dfd.resolve();
    });
    return dfd.promise;
  })).then(function() {
    cb();
  });
};
