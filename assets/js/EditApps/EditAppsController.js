/* global window */
(function(angular) {
  'use strict';

  var app = angular.module('featureApp');

  app.controller('EditAppsController', [
    '$scope',

    function EditAppsController($scope) {

      console.log('hi');
      console.info($scope);
    }
  ]);

})(window.angular, window.mouthPath || '/');
