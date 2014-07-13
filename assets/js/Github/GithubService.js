/** global window */
(function(angular, mountPath) {

  'use strict';

  console.info('GithubService loaded');

  // No [] here to make sure we're getting and not creating
  var app = angular.module('featureApp');

  app.factory('GithubService', [
    '$http',
    '$q',

    function GithubService($http, $q) {

      console.log('serviced');

      return {};
    }
  ]);

})(window.angular, window.mountPath);
