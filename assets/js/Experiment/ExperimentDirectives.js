/* global window, localStorage */
(function(angular, $, mountPath) {
  'use strict';

  console.info('AppDirectives loaded');

  var app = angular.module('featureApp');

  app.directive('editExperiment', [

    function() {
      return {
        restrict: 'A',
        templateUrl: mountPath + '/js/Experiment/EditExperiment.html',
        replace: true,
        link: function(scope, elem) {
          var exp = scope.exp
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
            localStorage.setItem('color.' + scope.app.github_repo + '.' + exp.name, color);
            scope.color = color;
          };

          scope.choose = function(choice) {
            exp.type = choice;
          };

          scope.setBoolean = function(choice) {
            exp.values.boolean = choice;
          };

          scope.isDirty = function(expData) {
            return ! angular.equals(expData, master);
          };

          scope.save = function(expData) {
            console.log(expData);
            // FIXME: Ready to save experiment
            alert('FIXME: now what?');
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
