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

    function() {
      console.log(arguments);
    }

    // function($routeProvider, $locationProvider) {
    //   $routeProvider
    //     .when('/', getRoute('Index'));
    //
    //   $locationProvider.html5Mode(true);
    // }
  ]);

  function getRoute(name) {
    var config = {
      templateUrl: '{0}js/{1}/{1}.html'.format(mountPath, name),
      controller: '{0}Controller'.format(name)
    };
    console.log(config);
    return config;
  }



})(window.angular, window.mountPath || '/');
