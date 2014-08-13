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
          var exp = scope.exp
            , master = angular.copy(exp);

          // Ready the "info" popover
          elem.find('[data-toggle="popover"]').popover();

          // Color is stored in localStorage. Fetch it
          scope.color = localStorage.getItem('color.' + scope.app.github_repo + '.' + exp.name) || 'default';

          // Function to display "Enabled" text for References
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

          // Function to display the "Enabled" text for Ranges
          scope.getEnabledRange = function() {
            var range = exp.values.range
              , min = range.min
              , max = range.max
              , diff = max - min
              , str = 'Enabled for ';

            if (min === 0) {
              if (max === 100) return str + 'all users:';
              return str + '{0}% of users:'.format(diff);
            }

            return 'Enabled for buckets {0}-{1} ({2}%)'.format(min, max, diff);
          };

          // Turn on/off a single reference
          scope.toggleReference = function(reference) {
            exp.values.reference[reference] = ! exp.values.reference[reference];
          };

          // Store the chosen color in localStorage
          scope.changeColor = function(color) {
            if (color === 'default') {
              localStorage.removeItem('color.' + scope.app.github_repo + '.' + exp.name);
            } else {
              localStorage.setItem('color.' + scope.app.github_repo + '.' + exp.name, color);
            }
            scope.color = color;
          };

          // Choose a type
          scope.choose = function(choice) {
            scope.failText = null;
            exp.type = choice;
          };

          // Set the boolean value
          scope.setBoolean = function(choice) {
            scope.failText = null;
            exp.values.boolean = choice;
          };

          // Check to see if the form is used
          scope.isDirty = function(expData) {
            return ! angular.equals(expData, master);
          };

          // Save all the data
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

          // Reset all the data
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
