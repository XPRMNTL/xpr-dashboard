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

      $scope._loaded = function(state) {
        if (state === undefined) return $rootScope.loading;
        console.log($rootScope);

        $rootScope.loading = state;
        console.log('Loading: ' + state);
      };
      $scope._loaded(true);

    }
  ]);

})(window.angular);
