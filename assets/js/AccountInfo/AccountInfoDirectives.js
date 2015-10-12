/* global window */

(function(angular, $, mountPath) {
  'use strict';

  var app = angular.module('featureApp');

  app.directive('accountInfo', [
    'userService',

    function(service) {
      return {
        restrict: 'A',
        templateUrl: mountPath + '/js/AccountInfo/AccountInfo.html',
        scope: '=',
        link: function(scope, element) {
          service
            .getUser()
            .then(function(user) {
              scope.user = user;
            });

          // element.on('click', '.btn', function() {
          //   $(this).button('loading');
          // });
        }
      };
    }
  ]);

})(window.angular, window.jQuery, window.mountPath || '');
