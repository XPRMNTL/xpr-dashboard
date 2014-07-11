/* global window */
(function(angular, mountPath) {
  'use strict';

  var app = angular.module('featureApp');

  app.controller('AppListController', [
    '$scope',

    function AppListController($scope) {
      console.info($scope);
      console.log(mountPath);
    }
  ]);

})(window.angular, window.mouthPath || '/');
