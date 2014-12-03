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


    describe('oepJoin', function() {
      var oepJoin;

      beforeEach(function() {
        oepJoin = filter('oepJoin');
      });

      it('should should join array', function() {
        expect(oepJoin([])).toEqual('');
        expect(oepJoin([1])).toEqual('1');
        expect(oepJoin([1, 2])).toEqual('1 & 2');
        expect(oepJoin([1, 2, 3])).toEqual('1, 2 & 3');
      });

      it('should should join array using provided separaters', function() {
        expect(oepJoin([1, 2, 3], {sep: ' | '})).toEqual('1 | 2 & 3');
        expect(oepJoin([1, 2, 3], {sep: ' | ',  lastSep: ' | '})).toEqual('1 | 2 | 3');
      });

      it('should should join array using provided accessor', function() {
        expect(oepJoin([1, 2, 3], {value: function(item) { return item * 2;}})).toEqual('2, 4 & 6');
      });
    });

    describe('oepYesNo', function() {
      var yesNo;

      beforeEach(function() {
        yesNo = filter('oepYesNo');
      });

      it('should convert null and indefined to empty No', function() {
        expect(yesNo(undefined)).toBe('No');
        expect(yesNo(null)).toBe('No');
      });

      it('should convert truthy to yes', function() {
        expect(yesNo(true)).toBe('Yes');
        expect(yesNo('foo')).toBe('Yes');
        expect(yesNo(10)).toBe('Yes');
        expect(yesNo(['foo'])).toBe('Yes');
      });

      it('should convert falsy (other that null and undefined) to no', function() {
        expect(yesNo(false)).toBe('No');
        expect(yesNo('')).toBe('No');
        expect(yesNo(0)).toBe('No');
      });

      it('should convert empty arry to no', function () {
        expect(yesNo([])).toBe('No');
      });

      it('should convert to provided map', function() {
        expect(yesNo(true, {yes: 'True', no: 'False', maybe: 'Maybe'})).toBe('True');
        expect(yesNo(false, {yes: 'True', no: 'False', maybe: 'Maybe'})).toBe('False');
        expect(yesNo(null, {yes: 'True', no: 'False', maybe: 'Maybe'})).toBe('Maybe');
      });

    });

  });

})();
