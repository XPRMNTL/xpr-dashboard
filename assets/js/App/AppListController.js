/* global window */
(function(angular) {
  'use strict';

  var app = angular.module('featureApp');

  app.controller('AppListController', [
    '$controller',
    '$scope',
    'appService',

    function AppListController($controller, $scope, appService) {
      $controller('BaseController', { $scope: $scope });

      appService
        .list()
        .then(function(appList) {
          $scope.appList = appList;
          $scope._loaded(false);
        }, function(err) {
          console.error(err);
          $scope.appListError = true;
          $scope._loaded(false);
        });

      $scope.nameOrder = function(item) {
        return item.name || item.github_repo;
      };
    }
  ]);

})(window.angular, window.mouthPath || '/');
