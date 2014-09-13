/* global window, localStorage */
(function(angular, $, mountPath, moment) {
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
        link: function(scope) {
          var exp = scope.exp
            , master = angular.copy(exp);

          scope.$watch('exp.date_modified', function(val) {
            scope.modified = moment(new Date(val));
          }, true);

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

          scope.showReferences = function() {
            return !! (exp.references);
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

            // experimentService.hack(scope.app._id, expData)
            //   .then(function() {
            //     console.log(arguments);
            //   }, function(err) {
            //     scope.failText = 'Update failed, sry: {0} ({1})'.format(err.statusText, err.status || '000');
            //   });

            experimentService.update(expData)
              .then(function(data) {
                ['value','references','date_modified'].map(function(key) {
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
            , app = scope.app
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

            var value = typeof refs[refName] !== 'undefined' ? refs[refName] : exp.value;
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
              group = groups[group];
            }
            if (typeof group === 'string') type = 'users';
            if (! group) return 'ERROR';

            var mapper = {
              percent: 'Buckets: {0}-{1} ({2}%)'.format(group.min, group.max, group.percent),
              users: 'Group: "{0}"'.format(name),
            };

            return mapper[type];
          };

          function editGroup(_group, idx) {
            var group = angular.copy(_group);
            console.log(arguments);

            // Set the ref and type
            if (typeof group.name !== 'string') {
              if (typeof group.min === 'number') group.type = 'percent';
              if (typeof group === 'string') {
                group = {
                  name : group,
                  list : angular.copy(groups[group])
                };
                group.frozenName = true;
                group.type = 'users';
              }
            } else {
              group.type = 'users';
            }

            if (typeof idx === 'number') group.index = idx;

            scope.$broadcast('openModal', group);
          }

          scope.$on('saveGroup', function(evt, group) {
            // var type = group.type
            var idx = group.index
              , edit = typeof idx === 'number'
              , name = group.name;

            if (group.frozenName) {
              edit = true;
              var i = exp.references[refName].indexOf(name);

              if (~i) idx = i;
            }

            delete group.type;

            if (name) {
              // Group name uniqueness
              if ((! edit) && groups[name]) return scope.$broadcast('invalid', 'name');

              /**
               * If it's a named group, save the group to the app and
               * save just the name here
               */
              groups[name] = group.list;
              group = group.name;
            }

            if (typeof idx === 'number') {
              exp.references[refName][idx] = group;
            } else {
              console.log('new');
              exp.references[refName].push(group);
            }

            scope.$broadcast('closeModal');
          });

          scope.editGroup = editGroup;

          scope.newGroup = function(type) {
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
        templateUrl: mountPath + '/js/Experiment/EditExperimentGroupModal.html',
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
              , list = group.list || (group.list = [])
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
              if (! _group.list) scope.invalid.push('users');
              if (_group.list && _group.list.length === 0) scope.invalid.push('users');
            }

            if (scope.invalid.length) return;

            scope.$emit('saveGroup', _group);
          };

          scope.getGroupList = function() {
            var groups = scope.app.groups
              , groupList = []
              , key;
            for (key in groups) {
              if (groups.hasOwnProperty(key)) {
                groupList.push(key);
              }
            }
            return groupList;
          };

          scope.typeaheadSelect = function(groupName) {
            group.name = groupName;
            group.list = angular.copy(scope.app.groups[groupName]);
            group.frozenName = true;
          };


          /**
           * Calculate min/max/percentage
           *
           * When we change the percentage or the min/max, we should calculate
           * the things we're not changing;
           */
          scope.$watch('group', function(val, prev) {
            if (! (val || prev)) return;
            if ( typeof val.min !== 'number') return;
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

})(window.angular, window.jQuery, window.mountPath || '', window.moment);
