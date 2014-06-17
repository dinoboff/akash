/**
 * oep.utils.filters - Miscellaneous Filters.
 *
 * Defines:
 *
 * - oepEmpty.
 *
 */
(function() {
  'use strict';

  angular.module('oep.utils.filters', []).

  filter('oepEmpty', [
    function() {
      return function(obj) {
        return !obj || Object.keys(obj).length === 0;
      };
    }
  ])

  ;

})();