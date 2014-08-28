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
        link: function(scope) {
          scope.variants = (angular.copy(scope.variantList) || [ true , false ]).concat('advanced');
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
        link: function(scope) {
          var exp = scope.exp
            , master = angular.copy(exp);

          if (exp.date_modified) scope.modified = moment(new Date(exp.date_modified));

          scope.isDefault = function(ref) {
            if (! exp.references) return false;

            var value = exp.references[ref];

            return value === undefined;
          };

          scope.isOn = function(ref) {
            if (! exp.references) return false;

            var value = exp.references[ref] || exp.value;
            return typeof value === 'boolean' ? value : false;
          };

          scope.hasGroups = function(ref) {
            if (! exp.references) return false;
            return typeof exp.references[ref] === 'object';
          };

          scope.toggleGroups = function(ref) {
            if (! exp.references) return false;

            if (exp.references[ref] === undefined) return (exp.references[ref] = []);
            if (typeof exp.references[ref] === 'boolean') return (exp.references[ref] = []);
            exp.references[ref] = false;
          };

          scope.removeCustom = function(ref) {
            delete exp.references[ref];
          };

          scope.getClassName = function(ref) {
            var classNames = [ 'default', 'success', 'warning', 'info', ]
              , idx = 0
              , value, advanced;

            if (! ref) {
              // Doesn't matter. If it's dirty, be danger
              if (scope.isDirty()) return 'panel-danger';

              // exp.value should be boolean only
              value = !! exp.value;
              // exp.value should be an object
              advanced = !! exp.references;
            } else {
              if (! exp.references) return false;
              // See if it's default or not
              value = exp.references[ref] || exp.value;

              // If it's not a boolean, this is groups, not true/false
              if (typeof value !== 'boolean') {
                value = false;
                advanced = true;
              }
            }

            // Like boolean flags
            if (value) idx += 1;
            if (advanced) idx += 2;

            return 'panel-' + classNames[idx];
          };

          scope.showReferences = function() {
            return !! exp.references;
          };

          scope.toggleReferences = function() {
            var prev = angular.copy(master.references) || {};

            exp.references = exp.references ? null : prev;
          };

          scope.getGroupName = function(group) {
            var str = 'Group: "{0}'
              , type = 'group';

            if (group.charAt(group.length - 1) === '%') {
              str = 'Percent: {0}';
              type = 'percent';
            }

            return str.format(group);
          };

          scope.isDirty = function(expData) {
            if (! expData) expData = exp;
            return ! angular.equals(expData, master);
          };

          scope.toggle = function(choice) {

            // If it's not a boolean, something is old or bad
            if (typeof choice !== 'boolean') {
              console.error('something is wrong');
              return;
            }

            // Don't care if they're already on that tab
            if (exp.value === choice) return;

            exp.value = choice;
            return;
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
