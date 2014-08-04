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
        fromRepo: fromRepo,
        list: list,
        save: save
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
          .then(function(data) {
            var exists = data !== undefined;

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
        }).then(function(resp) {
          var data = resp.data[0];
          if (cb) cb(null, data);
          return dfd.resolve(data);
        }, function(err) {
          if (cb) cb(err);
          return dfd.reject(err);
        });

        return dfd.promise;
      }

      function list(cb) {
        var dfd = $q.defer();

        $http
          .get(API)
          .then(function(resp) {
            var data = resp.data;
            if (cb) cb(null, data);
            dfd.resolve(data);
          }, function(err) {
            if (cb) cb(err);
            return dfd.reject(err);
          });

        return dfd.promise;
      }

      function save(app, cb) {
        var dfd = $q.defer()
          , url = API + app._id;

        if (! url) {
          return $q.reject({ statusText: 'Does not exist' });
        }

        $http
          .put(url, app)
          .then(function(resp) {
            dfd.resolve(resp.data);
          }, function(err) {
            console.error(err);
            if (cb) cb(err);
            dfd.reject(err);
          });

        return dfd.promise;
      }
    }
  ]);

})(window.angular, window.mountPath || '');
