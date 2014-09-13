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
      $scope.choices = {};

      function setChoices(name, items) {
        $scope.choices[name] = items.map(function(item) {
          if (typeof item === 'string') item = {
            name: item,
            disabled: false
          };

          return item;
        });
      }

      setChoices('types', [
        'boolean',
        'reference',
        'range',
        { name: 'variants', disabled: true },
        { name: 'groups', disabled: true }
      ]);
      setChoices('boolean', [
        { name: 'Enable', val: true },
        { name: 'Disable', val: false }
      ]);
      setChoices('reference', [ 'local', 'beta', 'prod' ]);


      (function(items) {
        $scope.types = items.map(function(item) {

          if (typeof item === 'string') item = {
            name: item,
            disabled: false
          };

          return item;
        });
      })([
        'boolean',
        'reference',
        { name: 'range', disabled: true },
        { name: 'variants', disabled: true },
        { name: 'groups', disabled: true }
      ]);

      var repo = $routeParams.repo;
      var master = {};

      appService
        .fromRepo(repo)
        .then(function(app) {
          update(app);
          $scope._loaded(false);
        }, function(err) {
          // FIXME: what to do in case of error?
          console.error(err);
          alert('fetch error');
        });

      $scope.cancel = function() {
        $scope.app = angular.copy(master);
        $scope.editMode = false;
      };

      $scope.toggleEdit = function() {
        $scope.editMode = ! $scope.editMode;
      };

      $scope.isUnchanged = function(appData) {
        return angular.equals(appData, master);
      };

      $scope.save = function() {
        appService
          .save($scope.app)
          .then(function(data) {
            update(data);
            $scope.editMode = false;
          }, function(err) {
            $scope.failText = 'Create failed, sry: {0} ({1})'.format(err.statusText, err.status);

            //FIXME: Error state for this
            alert('Something went wrong...');
            console.error(err);
          });
      };

      $scope.$watch('app.groups', function(val, prev) {
        if (! prev) return;

        appService
          .saveGroups($scope.app._id, val)
          .then(function(groups) {
            // FIXME: Do something here please
            console.info(groups);
            alert('group saved');
          }, function(err) {
            // FIXME: Error state here
            alert(err);
            console.error(err);
          });
      }, true);

      function update(data) {
        if (! data.groups) data.groups = {};

        master = angular.copy(data);
        $scope.app = data;
      }
    }
  ]);

})(window.angular, window.mouthPath || '/');
