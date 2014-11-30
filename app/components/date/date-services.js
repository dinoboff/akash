(function() {
  'use strict';

  angular.module('oep.date.services', []).

  /**
   * Settings for `oep.date.services`
   *
   * Can used to overwrite the timezone.
   *
   */
  value('oepDateSettings', {
    timezone: '+08:00'
  }).

  /**
   * Simple provider for moment
   */
  factory('moment', [
    '$window',
    function($window) {
      return $window.moment;
    }
  ]).

  /**
   * Return a date in a singapore tz.
   *
   * It will return a moment object with the correct offset, regardless
   * of the browser timezone settings.
   *
   * Usage:
   *
   *     var today = oepDate(),
   *       xmas = oepDate('2014-12-25');
   *
   */
  factory('oepDate', [
    'moment',
    'oepDateSettings',
    function oepDateFactory(moment, oepDateSettings) {
      return function oepDate(fmt) {
        var now = moment.utc(fmt).zone(oepDateSettings.timezone);
        return moment.utc(now.toArray().slice(0, 3));
      };
    }
  ]).

  /**
   * Return a date in an ISO 8601 format
   */
  factory('oepIsoDate', [
    'oepDate',
    function oepIsoDate(oepDate) {
      return function(date) {
        date = date || oepDate();
        return date.toISOString().split('T')[0];
      };
    }
  ])

  ;

})();
