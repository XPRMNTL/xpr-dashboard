/* global window */
(function(angular, $, mountPath) {
  'use strict';

  console.info('EditAppsDirectives loaded');

  var app = angular.module('featureApp');

  app.directive('appItem', [
    '$timeout',
    'appService',

    function($timeout, appService) {
      return {
        restrict: 'A',
        templateUrl: mountPath + '/js/EditApps/AppItem.html',
        replace: true,
        link: function(scope) {
          scope.status = 'ready';
          scope.submit = function() {
            var name = scope.app.name;
            scope.failText = null;
            appService
              .exists(name)
              .then(function(exists) {
                console.log(exists);
                if (exists) {
                  // FIXME: Something, right?
                  scope.failText = 'Already Exists, sry';
                  scope.status = 'edit';
                  scope.exists = true;
                  return;
                }

                appService
                  .create(name)
                  .then(function() {
                    // FIXME: now what?
                    scope.status = 'success';
                  }, function failure(err) {
                    // FIXME: Do something here
                    scope.failText = 'Create failed, sry: {0} ({1})'.format(err.statusText, err.status);
                    scope.status = 'failed';
                    // alert('save failed... Now what?');
                  });
              }, function fetchDown() {
                // FIXME: Do something here
                alert('another failed');
              });
            scope.status = 'saving';
          };
        }
      };
    }
  ]);

})(window.angular, window.jQuery, window.mountPath || '');
