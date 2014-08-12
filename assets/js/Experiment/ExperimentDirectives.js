/* global window, localStorage */
(function(angular, $, mountPath) {
  'use strict';

  console.info('ExperimentDirectives loaded');

  var app = angular.module('featureApp');

  app.directive('editExperiment', [
    'experimentService',

    function(experimentService) {
      return {
        restrict: 'A',
        templateUrl: mountPath + '/js/Experiment/EditExperiment.html',
        replace: true,
        link: function(scope, elem) {
          var appId = scope.app._id
            , exp = scope.exp
            , master = angular.copy(exp);

          elem.find('[data-toggle="popover"]').popover();

          scope.color = localStorage.getItem('color.' + scope.app.github_repo + '.' + exp.name) || 'default';

          scope.getEnabledFor = function() {
            var add = [];

            for (var key in exp.values.reference) {
              if (exp.values.reference.hasOwnProperty(key)) {
                if (exp.values.reference[key]) add.push(key);
              }
            }

            if (! add.length) return 'Disabled for All Users: ';
            return 'Enabled for ' + (add.join(', '));
          };

          scope.toggleReference = function(reference) {
            exp.values.reference[reference] = ! exp.values.reference[reference];
          };

          scope.changeColor = function(color) {
            if (color === 'default') {
              localStorage.removeItem('color.' + scope.app.github_repo + '.' + exp.name);
            } else {
              localStorage.setItem('color.' + scope.app.github_repo + '.' + exp.name, color);
            }
            scope.color = color;
          };

          scope.choose = function(choice) {
            scope.failText = null;
            exp.type = choice;
          };

          scope.setBoolean = function(choice) {
            scope.failText = null;
            exp.values.boolean = choice;
          };

          scope.isDirty = function(expData) {
            return ! angular.equals(expData, master);
          };

          scope.save = function(expData) {
            scope.failText = null;

            experimentService.update(expData)
              .then(function(data) {
                ['type','values','date_modified'].map(function(key) {
                  scope.exp[key] = data[key];
                });
                master = angular.copy(data);
              }, function(err) {
                scope.failText = 'Update failed, sry: {0} ({1})'.format(err.statusText, err.status || '000');
              });
          };

          scope.cancel = function() {
            for (var key in master) {
              if (master.hasOwnProperty(key)) {
                exp[key] = master[key];
              }
            }
            master = angular.copy(exp);
          };
        }
      };
    }
  ]);

})(window.angular, window.jQuery, window.mountPath || '');
