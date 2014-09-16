/* global window */

(function(angular) {
// (function(angular, mountPath) {
  'use strict';

  angular.module('featureApp', [
    'ngRoute'
    , 'ui-rangeSlider'
    , 'toggle-switch'
    , 'ngSanitize'
    , 'ui.bootstrap'
  ]);

})(window.angular, window.mountPath || '');
