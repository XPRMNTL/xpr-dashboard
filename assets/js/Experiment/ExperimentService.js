/* global window */

(function(angular, mountPath) {
  'use strict';

  // No [] here to make sure we're getting and not creating
  var app = angular.module('featureApp')
    , API = mountPath + '/api/experiment/';

  app.factory('experimentService', [
    '$http',
    '$q',

    function experimentService($http, $q) {

      return {
        hack: hackUpdate,
        update: update,
      };

      function hackUpdate(appId, experiment, cb) {
        var dfd = $q.defer()
          , url = API + 'hack/' + appId;

        if (! appId) {
          return $q.reject({ statusText: 'Does not exist' });
        }

        $http
          .put(url, experiment)
          .then(function(resp) {
            if (cb) cb(null, resp.data);
            dfd.resolve(resp.data);
          }, function(err) {
            console.error(err);
            if (cb) cb(err);
            dfd.reject(err);
          });

        return dfd.promise;
      }

      function update(experiment, cb) {
        var dfd = $q.defer()
          , id = experiment._id
          , url = API + id;

        if (! id) {
          return $q.reject({ statusText: 'Does not exist' });
        }

        $http
          .put(url, experiment)
          .then(function(resp) {
            var data = resp.data;
            if (cb) cb(null, data);
            dfd.resolve(data);
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
