/* global window, localStorage */
(function(angular, $, mountPath, moment) {
  'use strict';

  console.info('ExperimentDirectives loaded');

  var app = angular.module('featureApp');

  app.directive('choiceButtons', [
    function() {
      return {
        restrict: 'A',
        template: '<div class="btn-group btn-group-sm">'+
                  '  <button' +
                  '    class="btn btn-default"' +
                  '    data-ng-repeat="variant in variants"'+
                  '    data-ng-class="{ true: \'active\' }[variant === getCurrent()]"' +
                  '    data-ng-click="toggle(variant)"' +
                  '    data-ng-bind="variant"></button>'+
                  '</div>',
        replace: true,
        scope: {
          getCurrent: '=getCurrent',
          type: '=type',
          variantList: '=variants',
        },
        link: function(scope, elem, attrs) {
          scope.variants = (angular.copy(scope.variantList) || ['on', 'off']).concat('advanced');
          // scope.variants = (attrs.variants || ['on', 'off']).concat(['advanced']);
          // console.log(scope.variants);
          // if (! attrs.variants)
          // console.log(attrs.variants);
          // console.log(scope.variants);
          // if (scope.type === 'exp' && angular.equals([true,false,'advanced']))

          scope.toggle = function(text) {
            console.log(scope.getCurrent());

            if (scope.getCurrent() === text) return;


            if (text === 'on') text = true;
            if (text === 'off') text = false;



            scope.$emit('buttonChanged', text);
            // console.log(text);
          };
          // console.log(scope.choices.length);
          // console.log(scope.current);
          // console.log(scope.type);
          // console.log(scope);
          // console.log('sup homie');
        },
      };
    }
  ]);

  app.directive('editExperimentBeta', [
    'experimentService',

    function() {
      return {
        restrict: 'A',
        templateUrl: mountPath + '/js/Experiment/EditExperimentBeta.html',
        replace: true,
        link: function(scope, elem) {
          var exp = scope.exp
            , master = angular.copy(exp);

          if (exp.value === undefined && exp.values === undefined) exp.value = false;

          // Ready "info" popover
          elem.find('[data-toggle="popover"]').popover({ container: 'body', html: true });
          // if (exp.variants) scope.variants = angular.copy(exp.variants);
          // console.log(scope.choices.toggle);
          scope.choices.toggle = [
            { name : 'On', value : true },
            { name : 'Off', value : false },
            { name : 'Advanced' },
          ];
          if (exp.date_modified) scope.modified = moment(new Date(exp.date_modified));
          // scope.choices.toggle = [ 'On', 'Off', 'Advanced' ];
          // console.log(scope.exp);

          // scope.$on('buttonChanged', function(evt, text) {
          //   console.log(arguments);

          // });

          // Show how the buttons are toggled
          scope.getToggle = function(type) {
            var map = {
              // By value shown on the button
              value : function() {
                if (exp.value === null) return 'Advanced';

                return (!! exp.value) ? 'On' : 'Off';
              },
              // By className of the surrounding panel
              className : function() {
                if (scope.isDirty()) return 'danger';
                if (exp.value === null) return 'info';
                return exp.value ? 'success' : 'default';
              },
            };
            type = type || 'value';

            return (map[type] || map.value)();
          };

          scope.isDirty = function(expData) {
            if (! expData) expData = exp;
            return ! angular.equals(expData, master);
          };

          scope.toggle = function(choice) {
            // Don't care if they're already on that tab
            if (scope.getToggle() === choice.name) return;

            // If they're boolean, just move along
            if (choice.value !== undefined) return (exp.value = choice.value);

            // If there isn't already a multiple values, set them to previous choice
            if (! exp.values) {
              exp.values = {};
              scope.appTest.references.map(function(item) {
                exp.values[item] = exp.value;
              });
            }

            // Remove chosen "all-encompassing" value
            exp.value = null;
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
        },
      };
    }
  ]);

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

})(window.angular, window.jQuery, window.mountPath || '', window.moment);
