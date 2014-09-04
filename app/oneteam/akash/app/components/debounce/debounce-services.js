/**
 * oep.debounce.services
 *
 * Defines `oepDebounce`.
 *
 * TODO: doesn't really desserve a components of its own.
 * Maybe move it to misc?
 *
 */
(function() {
  'use strict';

  angular.module('oep.debounce.services', []).

  /**
   * oepDebounce - "Debounce" a function.
   *
   * The wrapper function will delay the execution of the original function
   * until `n` ms has passed between two consecutive calls of the wrapper
   * function.
   *
   * Returns a promise resolving to the returned value of the original function
   * call.
   *
   * Note: it merges all calls and will use the arguments receives with
   * the last call.
   *
   */
  factory('oepDebounce', ['$timeout', '$q',
    function($timeout, $q) {
      return function(fn, delay, invokeApply) {
        var timeoutPromise,
          nextResult;

        return function() {
          var self = this,
            args = arguments;

          if (timeoutPromise) {
            $timeout.cancel(timeoutPromise);
          }

          if(!nextResult) {
            nextResult = $q.defer();
          }

          timeoutPromise = $timeout(function() {
            var r = nextResult;

            timeoutPromise = null;
            nextResult = null;
            r.resolve(fn.apply(self, args));
          }, delay, invokeApply);

          return nextResult.promise;
        };

      };
    }
  ])


  ;

})();