/* global window */
(function(angular, mountPath) {

  'use strict';

  console.info('GithubService loaded');

  // No [] here to make sure we're getting and not creating
  var app = angular.module('featureApp')
    , API = mountPath + '/api/github';

  app.factory('GithubService', [
    '$http',
    '$q',

    function GithubService($http, $q) {

      return {
        getApps : getApps
      };

      function getApps(refresh) {
        var dfd = $q.defer()
          , url = API + '/apps';

        if (refresh) url += '?refresh';

        $http.get(url)
          .success(function(data, status, headers) {
            var fetched = headers('x-created-time');
            dfd.resolve([data, fetched]);
          })
          .error(function(data, status) {
            console.error(data, status);
            throw new Error('App Fetch Error');
          });

        return dfd.promise;
      }
    }
  ]);

})(window.angular, window.mountPath || '');
