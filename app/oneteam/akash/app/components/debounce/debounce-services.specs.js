/* jshint camelcase: false*/
/* global jasmine, describe, beforeEach, it, inject, expect */

(function() {
  'use strict';

  describe('oep.debounce.services', function() {
    var timeout;

    beforeEach(module('oep.debounce.services'));

    beforeEach(inject(function(_$timeout_) {
      timeout = _$timeout_;
    }));

    describe('oepDebounce', function() {
      var debounce;

      beforeEach(inject(function(oepDebounce) {
        debounce = oepDebounce;
      }));

      it('should call the function after the delay', function() {
        var spy = jasmine.createSpy('wrapped'),
          fn = debounce(spy, 500);

        fn();

        expect(spy).not.toHaveBeenCalled();
        timeout.flush();
        expect(spy).toHaveBeenCalled();
      });

      it('should merged function calls', function() {
        var spy = jasmine.createSpy('wrapped'),
          fn = debounce(spy, 500);

        fn();
        fn();
        fn();

        expect(spy).not.toHaveBeenCalled();
        timeout.flush();
        expect(spy.calls.length).toBe(1);
      });

      it('should call the wrapped fn with the arguments of the last call', function() {
        var spy = jasmine.createSpy('wrapped'),
          fn = debounce(spy, 500);

        fn(1);
        fn(1, 2);
        fn(1, 2, 3);

        timeout.flush();
        expect(spy.calls.length).toBe(1);
        expect(spy).toHaveBeenCalledWith(1, 2, 3);
      });

      it('should return a promise resolving to a the wrapped fn result', function() {
        var spy = jasmine.createSpy('then'),
          wrapped = function() { return 1; },
          fn = debounce(wrapped, 500);

        fn().then(spy);
        fn().then(spy);
        fn().then(spy);

        timeout.flush();
        expect(spy.calls.length).toBe(3);
        expect(spy).toHaveBeenCalledWith(1);
      });

    });
  });

})();