(function() {
  'use strict';

  angular.module('oep.date.filters', ['oep.date.services']).

  /**
   * Calculate the remaining time.
   *
   * A reference date can be given. If it it's missing, it will calculate
   * the time remaining from now.
   *
   */
  filter('oepDuration', [
    'moment',
    function oepDurationFactory(moment) {
      return function oepDuration(date, options) {
        date = moment.utc(date);
        options = options || {};
        options.ref = moment.utc(options.ref);
        return date.from(options.ref, true);
      };
    }
  ])

  ;

})();
