/* jshint camelcase: false*/
/* global describe, beforeEach, module, it, inject, expect */

(function() {
  'use strict';

  describe('oep.date.services', function() {
    beforeEach(module('oep.date.services'));

    beforeEach(inject(function() {}));


    describe('oepDate', function() {
      var settings, date;

      beforeEach(inject(function(oepDateSettings, oepDate) {
        settings = oepDateSettings;
        date = oepDate;
      }));

      it('Should set a date with the correct timezone', function() {
        settings.timezone = '-01:00';
        expect(
          date('2014-01-02T00:59:00.000+00:00').toArray()
        ).toEqual(
          [2014, 0, 1, 0, 0, 0, 0]
        );

        settings.timezone = '+01:00';
        expect(
          date('2014-01-01T23:59:00.000+00:00').toArray()
        ).toEqual(
          [2014, 0, 2, 0, 0, 0, 0]
        );

        settings.timezone = '+01:00';
        expect(
          date('2014-01-01').toArray()
        ).toEqual(
          [2014, 0, 1, 0, 0, 0, 0]
        );
      });

    });


    describe('oepIsoDate', function() {
      var settings, date, isoDate;

      beforeEach(inject(function(oepDateSettings, oepDate, oepIsoDate) {
        settings = oepDateSettings;
        date = oepDate;
        isoDate = oepIsoDate;
      }));

      it('should format date', function() {
        expect(isoDate(new Date('2015-01-01'))).toEqual('2015-01-01');
        expect(isoDate(date('2015-01-01'))).toEqual('2015-01-01');
      });

    });

  });

})();
