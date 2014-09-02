/* jshint camelcase: false*/
/* global describe, beforeEach, it, inject, expect */

(function() {
  'use strict';

  describe('eop.utils.filters', function() {
    var filter;

    beforeEach(module('oep.utils.filters'));

    beforeEach(inject(function($filter) {
      filter = $filter;
    }));


    describe('oepEmpty', function() {
      var oepEmpty;

      beforeEach(function() {
        oepEmpty = filter('oepEmpty');
      });

      it('should return true when an object has no properties', function() {
        expect(oepEmpty({})).toBe(true);
      });

      it('should return false when an object has any properties', function() {
        expect(oepEmpty({foo: 1})).toBe(false);
      });

      it('should return true when an array has no element', function() {
        expect(oepEmpty([])).toBe(true);
      });

      it('should return true when an array has any properties but no element', function() {
        var a = [];

        a.cursor = '';
        expect(oepEmpty(a)).toBe(true);
      });

      it('should return false when an object has any element', function() {
        expect(oepEmpty([1])).toBe(false);
      });

    });

    describe('oepPick', function() {
      var oepPick;

      beforeEach(function() {
        oepPick = filter('oepPick');
      });

      it('should return the selected properties', function() {
        expect(oepPick({foo: 1, bar: 2}, 'foo')).toEqual({foo: 1});
      });

      it('should return the selected nested properties', function() {
        expect(
          oepPick({foo: {bar: 1, baz: 2}, fooz: 2}, 'foo.bar')
        ).toEqual({foo: {bar: 1}});
      });

      it('should return an empty object if the property is missing', function() {
        expect(oepPick({}, 'foo')).toEqual({});
        expect(oepPick({'foo': {}}, 'foo.bar')).toEqual({'foo': {}});
        expect(oepPick({'foo': {bar: {}}}, 'foo.bar.baz')).toEqual({'foo': {bar: {}}});
      });

      it('should return the selected nested properties using brackets', function() {
        expect(
          oepPick({foo: {'bar baz': 1, baz: 2}, fooz: 2}, 'foo["bar baz"]')
        ).toEqual({foo: {'bar baz': 1}});
      });

    });

  });

})();