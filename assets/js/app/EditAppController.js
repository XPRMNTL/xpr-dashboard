/* global window */
(function(angular) {
  'use strict';

  console.info('EditAppController loaded');

  var app = angular.module('featureApp');

  app.controller('EditAppController', [
    '$controller',
    '$scope',
    '$routeParams',
    'appService',

    function EditAppController($controller, $scope, $routeParams, appService) {
      $controller('BaseController', { $scope: $scope });

      var repo = $routeParams.repo;

      console.log(repo);

      appService
        .fromRepo(repo)
        .then(function(app) {
          console.log(app);
          $scope.app = app;
          $scope._loaded(false);
        }, function(err) {
          // FIXME: what to do in case of error?
          console.error(err);
          alert('fetch error');
        });

      $scope.toggleEdit = function() {
        $scope.editMode = ! $scope.editMode;

        // FIXME: Do not allow them to edit the dev key
      };



      // appService
      //   .list()
      //   .then(function(appList) {
      //     console.log(appList);
      //     $scope.appList = appList;
      //     // $scope.appList = [];
      //     //   { name: 'Pretend App 1', count: 2 },
      //     //   { name: 'Pretend App 2', count: 5 }
      //     // ];
      //   }, function(err) {
      //     // FIXME: What to do in case of error
      //     console.error(err);
      //     alert('appList fetch err, what now?');
      //   });
    }
  ]);

})(window.angular, window.mouthPath || '/');
