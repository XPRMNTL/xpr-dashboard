/* global window */
(function(angular, $, mountPath) {
  'use strict';

  var app = angular.module('featureApp');

  app.directive('appItem', [
    'appService',
    '$location',

    function(appService, $location) {
      return {
        restrict: 'A',
        templateUrl: mountPath + '/js/App/AppItem.html',
        replace: true,
        link: function(scope, elem, attrs) {
          var app = scope.app;
          if (attrs.appItem === 'edit') {
            scope.exists = true;
          }

          scope.actionText = function() {
            var texts = {
              true : {
                true : 'Going...',
                false : 'Adding...',
              },
              false: {
                true: 'Edit',
                false : 'Add',
              },
            };

            return texts[scope.status === 'loading'][!! scope.exists];
          };

          scope.actionIcon = function() {
            if (scope.status === 'loading') return 'glyphicon-time';

            return {
              true: 'glyphicon-cog',
              false: 'glyphicon-plus',
            }[!! scope.exists];
          };

          scope.status = 'ready';

          scope.defaultAction = function(action) {
            var mapper = {
              edit : goToItem,
              add : create,
            };

            action = action || scope.exists ? 'edit' : 'add';

            mapper[action]();
          };

          scope.submit = create;
          scope.getEditUrl = getEditUrl;
          scope.goToItem = goToItem;

          function create() {
            scope.status = 'loading';
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
          }

          function getEditUrl(){
            scope.status = 'loading';
            scope.failText = '';
            var url = 'edit/{0}'.format(window.encodeURIComponent(app.github_repo || app.name));
            return url;
          }

          function goToItem() {
            var url = getEditUrl();

            $location.path(url);
          }
        }
      };
    }
  ]);

})(window.angular, window.jQuery, window.mountPath || '');
