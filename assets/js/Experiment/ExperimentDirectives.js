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

  app.directive('editExperiment', [
    'experimentService',

    function(experimentService) {
      return {
        restrict: 'A',
        templateUrl: mountPath + '/js/Experiment/EditExperiment.html',
        replace: true,
        link: function(scope) {
          var exp = scope.exp
            , master = angular.copy(exp);

          if (exp.date_modified) scope.modified = moment(new Date(exp.date_modified));

          scope.getClassName = function() {
            var classNames = [ 'default', 'success', 'warning', 'info', ]
              , idx = 0;

            // Doesn't matter. If it's dirty, be danger
            if (scope.isDirty()) return 'panel-danger';

            // exp.value should be boolean only
            if (exp.value) idx += 1;

            if (exp.references) idx += 2;

            return 'panel-' + classNames[idx];
          };

          scope.toggleReferences = function() {
            var prev = angular.copy(master.references) || {};

            exp.references = exp.references ? null : prev;
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

          // Save all the data
          scope.save = function(expData) {
            scope.failText = null;

            experimentService.hack(scope.app._id, expData)
              .then(function() {
                console.log(arguments);
              }, function(err) {
                scope.failText = 'Update failed, sry: {0} ({1})'.format(err.statusText, err.status || '000');
              });

            // experimentService.update(expData)
            //   .then(function(data) {
            //     ['type','values','date_modified'].map(function(key) {
            //       scope.exp[key] = data[key];
            //     });
            //     master = angular.copy(data);
            //   }, function(err) {
            //     scope.failText = 'Update failed, sry: {0} ({1})'.format(err.statusText, err.status || '000');
            //   });
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

  app.directive('editExperimentRef', [
    function() {
      return {
        restrict: 'A',
        templateUrl: mountPath + '/js/Experiment/EditExperimentRef.html',
        replace: true,
        link: function(scope) {
          var exp = scope.exp
            , refName = scope.refName
            , app = scope.appTest
            , groups = app.groups;

          scope.getClassName = function() {
            var classNames = [ 'default', 'success', 'warning', 'info', ]
              , idx = 0
              , refs = exp.references
              , value, advanced;

            if (! refs) return false;
            // See if it's default or not
            value = refs[refName] || exp.value;

            // If it's not a boolean, this is groups, not true/false
            if (typeof value !== 'boolean') {
              value = false;
              advanced = true;
            }

            // Like boolean flags
            if (value) idx += 1;
            if (advanced) idx += 2;

            return 'panel-' + classNames[idx];
          };

          scope.isOn = function() {
            var refs = exp.references;
            if (! refs) return false;

            var value = refs[refName] || exp.value;
            return typeof value === 'boolean' ? value : false;
          };

          scope.hasGroups = function() {
            var refs = exp.references;
            if (! refs) return false;

            return angular.isArray(refs[refName]);
          };

          scope.toggleGroups = function() {
            var refs = exp.references;
            if (! refs) return false;

            exp.value = false;
            if (refs[refName] === undefined) return (refs[refName] = []);
            if (typeof refs[refName] === 'boolean') return (refs[refName] = []);
            refs[refName] = false;
          };

          scope.getGroupName = function(group) {
            var type, name;

            if (typeof group.min === 'number') type = 'percent';
            if (typeof group === 'string') {
              type = 'users';
              name = group;
              group = scope.appTest.groups[group];
            }
            if (typeof group === 'string') type = 'users';

            var mapper = {
              percent: 'Buckets: {0}-{1} ({2}%)'.format(group.min, group.max, group.percent),
              users: 'Group: "{0}"'.format(name),
            };

            return mapper[type];
          };

          function editGroup(_group) {
            var group = angular.copy(_group);

            // Set the ref and type
            if (typeof group.name !== 'string') {
              if (typeof group.min === 'number') group.type = 'percent';
              if (typeof group === 'string') {
                group = {
                  name : group,
                  list : scope.appTest.groups[group]
                };
                group.frozenName = true;
                group.type = 'users';
              }
            } else {
              group.type = 'users';
            }

            scope.$broadcast('openModal', group);
          }

          scope.$on('saveGroup', function(evt, group) {
            var type = group.type
              , edit, name;

            delete group.type;

            if (group.name) {
              name = group.name;
            }

            /**
             * If it's users, save the group to the app and
             * save just the name here
             */
            if (type === 'users') {
              if (group.frozenName) edit = true;
              if ((!edit) && groups[name]) return scope.$broadcast('invalid', 'name');

              groups[name] = group.list;
              group = group.name;
            }

            if (! edit) exp.references[refName].push(group);
            scope.$broadcast('closeModal');
          });

          scope.editGroup = editGroup;

          scope.newGroup = function(type) {
            console.log(type);
            var newGroups = {
                percent: {
                  min: 0,
                  max: 99,
                  percent: 100,
                },
                users: {
                  name: '',
                  list: [],
                },
              };

            editGroup(newGroups[type]);
          };

          scope.removeGroup = function(idx) {
            if (! exp.references) return false;

            var data = exp.references[refName];

            data.splice(idx, 1);
          };
        }
      };
    }
  ]);

  app.directive('editExperimentGroupModal', [
    function() {
      return {
        restrict: 'A',
        templateUrl: mountPath + '/js/Experiment/editExperimentGroupModal.html',
        replace: true,
        link: function(scope, elem) {
          var exp = scope.exp
            , refName = scope.refName
            , group;

          scope.invalid = [];

          elem.modal({ backdrop: 'static', show: false });

          scope.$on('openModal', function(evt, _group) {
            scope.invalid = [];
            scope.group = group = _group;

            elem.modal('show');
          });

          scope.$on('invalid', function(evt, type) {
            scope.invalid.push(type);
          });

          scope.$on('closeModal', function() {
            elem.modal('hide');
          });

          scope.getModalTitle = function() {
            if (! group) return;

            var strs = {
                percent : 'Buckets: {0} ({1})',
                users: 'Group: "{2}" for {0} ({1})',
              }
              , str = strs[group.type];

            return str.format(exp.name, refName, group.name);
          };

          scope.checkError = function(field) {
            return !! ~ scope.invalid.indexOf(field);
          };

          scope.addUser = function() {
            var user = scope.newUser
              , list = group.list
              , idx;

            // Nothing if empty
            if (! user) return;

            // If it's already there, just stick it at the end of the list.
            if ((idx = list.indexOf(user)) !== -1) list.splice(idx, 1);

            // Add to end of list
            list.push(user);

            // Empty
            scope.newUser = null;
          };

          // For removing the user
          scope.removeUser = function(idx) {
            group.list.splice(idx, 1);
          };

          /**
           * For saving the full group
           *
           * Validates that the name isn't empty.
           * Emits save event up to $parent
           */
          scope.saveGroup = function() {
            scope.invalid = [];

            var _group = angular.copy(group);

            // Validation
            if (group.type === 'users') {
              if (_group.name === '') scope.invalid.push('name');
              if (_group.list.length === 0) scope.invalid.push('users');
            }

            if (scope.invalid.length) return;

            scope.$emit('saveGroup', _group);
          };


          /**
           * Calculate min/max/percentage
           *
           * When we change the percentage or the min/max, we should calculate
           * the things we're not changing;
           */
          scope.$watch('group', function(val, prev) {
            if (! (val || prev)) return;
            if (angular.equals(val, prev)) return;
            var min = val.min
              , max = val.max
              , percent = Math.floor(val.percent);

            // If we're using a changed percentage...
            if ((! prev) || (val.percent !== prev.percent)) {
              if (! percent) val.percent = 1;

              // This should prevent ∞ recursion... Is it still necessary?
              // if (percent === (max - min) + 1 ) return;

              // Anything over 99 is 100 (0-99)
              if (percent > 99) {
                val.min = 0;
                val.max = 99;
                val.percent = 100;
                return;
              }

              // Anything that's too big from current min ends at 100
              if ((99 - min) < percent) {
                val.max = 99;
                val.min = 99 - (percent - 1);
              } else {
                // Otherwise move the max only
                val.max = val.min + (percent - 1);
              }
            } else {
              // If other nubmers changed, calculate percent
              val.percent = (max - min) + 1;
            }
          }, true);
        }
      };
    }
  ]);

  app.directive('editExperimentOld', [
    'experimentService',

    function(experimentService) {

      return {
        restrict: 'A',
        templateUrl: mountPath + '/js/Experiment/EditExperimentOld.html',
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