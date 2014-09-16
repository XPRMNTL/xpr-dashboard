/* global window, localStorage */
(function(angular, mountPath) {

  'use strict';

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
          , url = API + '/apps'
          , list;

        if (! refresh) list = _local();

        if (list) {
          dfd.resolve(list);
          return dfd.promise;
        }

        $http.get(url)
          .success(function(data, status, headers) {

            _local(data);

            var fetched = headers('x-created-time');
            dfd.resolve({
              list : data,
              time : fetched
            });
          })
          .error(function(data, status) {
            console.error(data, status);
            throw new Error('App Fetch Error');
            //FIXME: Error State
          });

        return dfd.promise;

        function _local(list) {
          if (! list) {
            try {
              return JSON.parse(localStorage.getItem('addAppList'));
            } catch (e) {
              return false;
            }
          }

          var data = {
            list : list,
            time : new Date()
          };

          localStorage.setItem('addAppList', JSON.stringify(data));
        }
      }
    }
  ]);

})(window.angular, window.mountPath || '');
