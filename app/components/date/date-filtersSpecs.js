/* jshint camelcase: false*/
/* global describe, beforeEach, module, it, inject, expect */

(function() {
  'use strict';

  describe('oep.date.filters', function() {
    var filter;

    beforeEach(module('oep.date.filters'));

    beforeEach(inject(function($filter) {
      filter = $filter;
    }));


    describe('oepDuration', function() {
      var duration;

      beforeEach(function() {
        duration = filter('oepDuration');
      });

      it('should calculate a duration regardless of local', function() {
        var ref = '2014-11-30T20:00:00+08:00';

        expect(duration('2014-11-30T12:00:00+00:00', {
          ref: ref
        })).toBe('a few seconds');
        expect(duration('2014-11-30T15:00:00+00:00', {
          ref: ref
        })).toBe('3 hours');
        expect(duration('2014-12-06T12:00:00+00:00', {
          ref: ref
        })).toBe('6 days');
      });

    });

  });

})();
