/* global window */
(function(angular, mountPath) {
  'use strict';

  if (! String.prototype.format) {
    String.prototype.format = function() {
      var s = this
        , i = arguments.length;

      while(i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
      }
      return s;
    };
  }

  var app = angular.module('featureApp');

  app.config([
    '$routeProvider',
    '$locationProvider',

    function($routeProvider, $locationProvider) {
      $routeProvider
        .when('/', getRoute('AppList'))
        .when('/editApps', getRoute('EditApps'));

      $locationProvider.html5Mode(true);
    }
  ]);

  function getRoute(name) {
    var config = {
      templateUrl: '{0}/js/{1}/{1}View.html'.format(mountPath, name),
      controller: '{0}Controller'.format(name)
    };
    return config;
  }



})(window.angular, window.mountPath || '');
