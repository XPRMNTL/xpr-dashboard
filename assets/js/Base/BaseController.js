/* global window */
(function(angular) {
  'use strict';

  console.info('BaseController loaded');

  var app = angular.module('featureApp');

  app.controller('BaseController', [
    '$rootScope',
    '$scope',

    function BaseController($rootScope, $scope) {
      console.info('baseControllered');

      $scope.clearSearch = function() {
        $scope.search = {};
      };

      $scope._loaded = function(state) {
        if (state === undefined) return $rootScope.loading;

        $rootScope.loading = state;
      };
      $scope._loaded(true);

    }
  ]);

})(window.angular);
