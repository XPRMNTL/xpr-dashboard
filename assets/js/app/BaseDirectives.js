/* global window */
  (function(angular) {
    'use strict';

    console.info('BaseDirectives loaded');

    var app = angular.module('featureApp');

    app.directive('loading', [
      function() {
        return {
          restrict: 'E',
          template: '<div class="loadingStatus" data-ng-show="show"></div>',
          replace: true,
          scope: {
            status: '=status'
          },
          link: function(scope, element) {
            var interval, msgs = [
              'Locating the required gigapixels to render',
              'Spinning up the hamster',
              'Shovelling coal into the server',
              'Programming the flux capacitor',
              '640K ought to be enough for anybody',
              'Would you prefer chicken, steak, or tofu?',
              'Pay no attention to the man behind the curtain',
              'Would you like fries with that?',
              'Checking the gravitational constant in your locale',
              'At least you\'re not on hold',
              'The server is powered by a lemon and two electrodes',
              'We love you just the way you are',
              'Take a moment to sign up for our lovely prizes',
              'Don\'t think of purple hippos',
              'Wait while the satellite moves into position',
              'It\'s still faster than you could draw it',
              'My other load screen is much faster. You should try that one instead.',
              'The version I have of this in testing has much funnier load screens',
              'Loading humorous message',
              'Warming up Large Hadron Collider',
              'The magic elves are working frantically in here',
              'Happy Elf and Sad Elf are talking about your data',
              'All the relevant elves are on break',
              'Elf down! We\'re cloning the elf that was supposed to get you the data',
              'Time is an illusion. Loading time doubly so',
              'Are we there yet?',
              'Please insert 25¢',
              'Hang on a sec, I know your data is here somewhere',
              'HELP!, I\'m being held hostage, and forced to write the stupid lines!',
              'Searching for Answer to Life, the Universe, and Everything',
              'Waiting for the system admin to hit enter',
              'Paging for the system admin',
              'Warming up the processors',
              'RE-calibrating the internet',
              'We apologise for the fault in the subtitles. Those responsible have been sacked',
              'Counting backwards from infinity',
              'Scanning your hard drive for credit card details. Please be patient',
              'Don\'t panic',
              'Loading the loading message',
              'Potent potables',
              'Reticulating Splines'
            ];
            scope.$watch('status', function(newVal, oldVal) {
              // Always show/hide based on loading status
              scope.show = newVal;

              if (newVal === false) window.clearInterval(interval);
              if (newVal === true && oldVal === false) return startLoading();

              if (newVal === 'failed') {
                window.clearInterval(interval);
                element.html('Query failed... Please try again');
              }
            });

            function startLoading() {
              scope.show = true;
              interval = window.setInterval(function() {
                var msg = msgs[Math.round(Math.random()*(msgs.length-1))];
                element.text(msg + '...');
              }, 1500);
              element.text('Loading...');
            }

            startLoading();
          }
        };
      }
    ]);

  })(window.angular);
