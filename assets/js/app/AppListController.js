/* global window */
(function(angular) {
  'use strict';

  console.info('AppListController loaded');

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
          console.log(appList);
          $scope.appList = appList;
          console.log($scope._loaded);
          $scope._loaded(false);
        }, function(err) {
          // FIXME: What to do in case of error
          console.error(err);
          alert('appList fetch err, what now?');
        });
    }
  ]);

})(window.angular, window.mouthPath || '/');
