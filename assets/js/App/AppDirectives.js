/* global window */
(function(angular, $, mountPath) {
  'use strict';

  console.info('AppDirectives loaded');

  var app = angular.module('featureApp');

  app.directive('appItem', [
    'appService',

    function(appService) {
      return {
        restrict: 'A',
        templateUrl: mountPath + '/js/App/AppItem.html',
        replace: true,
        link: function(scope, elem, attrs) {
          if (attrs.appItem === 'edit') {
            scope.exists = true;
          }
          scope.status = 'ready';
          scope.submit = function() {
            scope.status = 'saving';
            var name = scope.app.name;
            scope.failText = null;
            appService
              .exists(name)
              .then(function(exists) {
                if (exists) {
                  scope.failText = 'Already Exists, sry';
                  scope.status = 'edit';
                  scope.exists = true;
                  return;
                }

                appService
                  .create(name)
                  .then(function() {
                    scope.status = 'success';
                    scope.exists = true;
                  }, function failure(err) {
                    scope.failText = 'Create failed, sry: {0} ({1})'.format(err.statusText, err.status);
                    scope.status = 'failed';
                  });
              }, function fetchDown(err) {
                scope.failText = 'Dup-check failed, sry: {0} ({1})'.format(err.statusText, err.status);
                scope.status = 'failed';
              });
          };
        }
      };
    }
  ]);

})(window.angular, window.jQuery, window.mountPath || '');
