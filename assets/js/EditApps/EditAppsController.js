/* global window */
(function(angular) {
  'use strict';

  console.info('EditAppsController loaded');

  var app = angular.module('featureApp');

  app.controller('EditAppsController', [
    '$scope',
    '$controller',
    'GithubService',

    function EditAppsController($scope, $controller, githubService) {
      $controller('BaseController', { $scope: $scope });

      console.log('hi');
      console.info($scope);
      console.log(githubService);
    }
  ]);

})(window.angular, window.mouthPath || '/');
