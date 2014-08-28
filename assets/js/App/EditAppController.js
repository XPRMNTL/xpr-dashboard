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

      function update(data) {

        $scope.appTest = {
          name : data.name,
          dev_key : data.dev_key,
          references : [ 'local', 'beta', 'prod', ],
          groups : {
            'Program Managers': [1, 2, 3, 4],
            'Web Devs': [ 'dncrews', 'jdcrowthe', 'jamesblack' ],
            'phase 1': '20-30%',
            'phase 2': '20-50%',
            'phase 3': '20-60%'
          },
          experiments : [
            {
              name : 'sampleExp',
              description : 'This is a pretend experiment, but here I\'ve defined what the description would\'ve been.',
              // links: [ 'https://google.com', { 'Description': 'What\'s the point of this link?', 'url': 'https://familysearch.org'}, ],
              value : true,
              references : null,
              date_modified: '2014-09-20T20:16:17.483Z',
            },
            {
              name : 'testLinkExp',
              description : 'This description has a link. Likey? <a target="reference" href="https://google.com">Here is a link.</a>. I wish there was an easier way to do this...',
              value : false,
              references : null,
              date_modified: '2014-08-19T20:16:17.483Z',
            },
            {
              name : 'headerFooterExp',
              description : 'This boolean has differing values',
              value : false,
              references : {
                local : true,
                prod : [ '0-25%', 'Program Managers', 'Web Devs' ],
              },
              date_modified: '2014-08-18T20:16:17.483Z',
            },
            // {
            //   name : 'rangedExp',
            //   description : 'This one has a range too',
            //   value : null,
            //   values : {
            //     local : true,
            //     beta : true,
            //     prod : '0-20%',
            //   },
            //   date_modified: '2014-08-17T20:16:17.483Z',
            // },
            // {
            //   name : 'var1',
            //   description : 'This is a variant',
            //   value : null,
            //   values : {
            //     blue : '0-20%',
            //     red : '21-50%',
            //     green : '51-100%',
            //   },
            //   variants : [ 'blue', 'red', 'green' ],
            //   date_modified: '2014-08-16T20:16:17.483Z',
            // },
            // {
            //   name : 'var2',
            //   description : 'This has no 51-100%',
            //   value : null,
            //   values : {
            //     something : '0-20%',
            //     somethingElse : '21-50%',
            //   },
            //   variants : [ 'something', 'somethingElse' ],
            //   date_modified: '2014-08-15T20:16:17.483Z',
            // },
          ],
        };

        master = angular.copy(data);
        $scope.app = data;
      }
    }
  ]);

})(window.angular, window.mouthPath || '/');
