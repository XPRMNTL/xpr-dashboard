/* global window */
(function(angular, $, mountPath) {
  'use strict';

  console.info('EditAppsDirectives loaded');

  var app = angular.module('featureApp');

  app.directive('appItem', [
    '$timeout',

    function($timeout) {
      return {
        restrict: 'A',
        templateUrl: mountPath + '/js/EditApps/AppItem.html',
        replace: true,
        link: function(scope) {
          scope.status = 'ready';
          scope.submit = function() {
            scope.status = 'saving';
            $timeout(function() {
              scope.status = 'ready';
            }, 3000);
          };
        }
      };
    }
  ]);

})(window.angular, window.jQuery, window.mountPath || '');
