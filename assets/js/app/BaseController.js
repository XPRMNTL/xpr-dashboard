/* global window */
(function(angular) {
  'use strict';

  console.info('BaseController loaded');

  var app = angular.module('featureApp');

  app.controller('BaseController', [
    '$scope',

    function BaseController($scope) {
      console.info('baseControllered');
      $scope.loading = true;
    }
  ]);

})(window.angular);
