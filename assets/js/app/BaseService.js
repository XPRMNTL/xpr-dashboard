/* global window */

(function(angular, mountPath) {
  'use strict';

  console.info('BaseService Loaded');

  // No [] here to make sure we're getting and not creating
  var app = angular.module('featureApp')
    , API = mountPath + '/api/app/';

  app.factory('appService', [
    '$http',
    '$q',

    function appService($http, $q) {

      return {
        create: create,
        exists: exists,
        fromRepo: fromRepo
      };

      function create(repoName, cb) {
        var dfd = $q.defer();

        $http.post(API, {
          github_repo : repoName
        }).then(function(data) {
          if (cb) cb(null, data);
          return dfd.resolve(data);
        }, function createFailed(err) {
          // TODO: Is there anything I care about here?
          if (cb) cb(err);
          return dfd.reject(err);
        });

        return dfd.promise;
      }

      function exists(repoName, cb) {
        var dfd = $q.defer();

        fromRepo(repoName)
          .then(function(resp) {
            var exists = !! resp.data.length;

            if (cb) cb(null, exists);
            return dfd.resolve(exists);
          }, function(err) {
            // TODO: Is there anything I want to do on failure?
            if (cb) cb(err);
            return dfd.reject(err);
          });

        return dfd.promise;
      }

      function fromRepo(repoName, cb) {
        var dfd = $q.defer();

        $http({
          method : 'GET',
          url : API,
          params: {
            github_repo: repoName
          }
        }).then(function(data) {
          if (cb) cb(null, data);
          return dfd.resolve(data);
        }, function(err) {
          if (cb) cb(err);
          return dfd.reject(err);
        });

        return dfd.promise;
      }
    }
  ]);

})(window.angular, window.mountPath || '');
