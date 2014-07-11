/* global window */

(function(angular, $) {
  'use strict';

  console.log('hiDirective');

  var app = angular.module('featureApp');

  app.directive('accountInfo', [
    'userService',

    function(service) {
      console.log('service?');
      return {
        restrict: 'A',
        templateUrl: 'templates/accountInfo.html',
        scope: '=',
        link: function(scope, element) {
          service
            .getUser()
            .then(function(user) {
              scope.user = user;
            });

          element.on('click', '.btn', function() {
            $(this).button('loading');
          });
        }
      };
    }
  ]);

})(window.angular, window.jQuery);
