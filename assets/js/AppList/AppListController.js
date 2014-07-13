/* global window */
(function(angular) {
  'use strict';

  console.info('AppListController loaded');

  var app = angular.module('featureApp');

  app.controller('AppListController', [
    '$scope',

    function AppListController($scope) {

      $scope.appList = [
        { name: 'Pretend App 1', count: 2 },
        { name: 'Pretend App 2', count: 5 }
      ];
      console.info($scope);
    }
  ]);

})(window.angular, window.mouthPath || '/');
