/* global window */

(function(angular, mountPath) {
  'use strict';

  console.info('AccountInfoService Loaded');

  // No [] here to make sure we're getting and not creating
  var app = angular.module('featureApp')
    , API = mountPath + 'auth/';

  app.factory('userService', [
    '$http',
    '$q',

    function userService($http, $q) {
      var userDfd;

      return {
        getUser : getUser
      };

      function getUser(cb) {
        if (! userDfd) userDfd = checkSession();

        if (! cb) return userDfd;

        userDfd.then(function(data) {
          cb(null, data);
        }, function(err) {
          cb(err);
        });

        return userDfd;
      }

      function checkSession() {
        var dfd = $q.defer();

        $http
          .get(API + 'user')
          .then(function(res) {
            if (res.status !== 200) return fail();
            dfd.resolve(res.data);
          }, fail);

        return dfd.promise;

        function fail() {
          var err = new Error ('fetchUser failure');
          // TODO: What do I want to do on failures here?

          return dfd.reject(err);
        }
      }
    }
  ]);

})(window.angular, window.mountPath || '/');
