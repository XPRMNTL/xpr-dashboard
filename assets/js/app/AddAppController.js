/* global window */
(function(angular, moment) {
  'use strict';

  console.info('AddAppController loaded');

  var app = angular.module('featureApp');

  app.controller('AddAppController', [
    '$controller',
    '$scope',
    'GithubService',

    function AddAppController($controller, $scope, github) {
      $controller('BaseController', { $scope: $scope });
      $scope.open = [];

      fetchList();

      $scope.toggleView = function(index) {
        $scope.open[index] = ! $scope.open[index];
      };

      $scope.addApp = function(app) {
        console.log(app);
        // appServic
      };

      $scope.refreshList = function() {
        // I do NOT want to get this happening a bunch at a time
        if ($scope._loaded()) return;

        $scope._loaded(true);
        fetchList(true);
      };

      function fetchList(refresh) {
        github
          .getApps(refresh)
          .then(function(results) {
            var orgList = results[0]
              , fetched = results[1];

            if (fetched) {
              fetched = moment(new Date(fetched));
              fetched = {
                fromNow : fetched.fromNow(),
                format : fetched.format('llll')
              };
            } else {
              fetched = {
                fromNow : 'sometime, hopefully; Not sure when.',
                format : 'I said I don\'t know!'
              };
            }

            $scope.clearSearch = function() {
              $scope.search.name = '';
            };

            $scope.orgList = orgList;
            $scope.fetched = fetched;
            $scope._loaded(false);
          });
      }
    }

  ]);

})(window.angular, window.moment);
