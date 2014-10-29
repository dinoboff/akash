/* jshint camelcase: false*/
/* global describe, beforeEach, module, it, inject, expect */

(function() {
  'use strict';

  describe('oep.form.directives', function() {
    var compile, scope, elem;

    beforeEach(module('oep.form.directives'));

    beforeEach(inject(function(_$compile_, _$rootScope_) {
      compile = _$compile_;
      scope = _$rootScope_;
    }));


    describe('oepInteger', function() {

      beforeEach(function() {
        scope.some = {};
        elem = compile([
          '<form name="someForm">',
          '<input type="text" name="someInt" ng-model="some.int" oep-integer>',
          '</form>'
        ].join('\n'))(scope);
      });

      it('Should filter invalid number', function() {
        scope.some.int = 'foo';
        scope.$apply();
        expect(scope.someForm.someInt.$viewValue).toBe(undefined);
      });

      it('Should filter valid number', function() {
        scope.some.int = '1';
        scope.$apply();
        expect(scope.someForm.someInt.$viewValue).toBe(1);
      });

      it('should validate valid input', function() {
        scope.someForm.someInt.$setViewValue('1');
        expect(scope.someForm.someInt.$error.oepInteger).toBe(false);
      });

      it('should invalidate invalid input', function() {
        scope.someForm.someInt.$setViewValue('foo');
        expect(scope.someForm.someInt.$error.oepInteger).toBe(true);
      });

    });

    describe('oepBsValidClass', function() {

      beforeEach(function() {
        scope.some = {};
        elem = compile([
          '<form name="someForm">',
          '<div class="form-group">',
          '<input type="text" name="someInput" ng-model="some.value" required oep-bs-valid-class>',
          '</div>',
          '</form>'
        ].join('\n'))(scope);
      });

      it('should not reflect any state while the input is pristine', function() {
        expect(elem.find('.form-group').hasClass('has-error')).toBe(false);
        expect(elem.find('.form-group').hasClass('has-success')).toBe(false);
      });

      it('should reflect valid state', function(){
        scope.someForm.someInput.$setViewValue('foo');
        expect(elem.find('.form-group').hasClass('has-error')).toBe(false);
        expect(elem.find('.form-group').hasClass('has-success')).toBe(true);
      });

      it('should reflect invalid state', function(){
        scope.someForm.someInput.$setViewValue('foo');
        scope.someForm.someInput.$setViewValue('');
        expect(elem.find('.form-group').hasClass('has-error')).toBe(true);
        expect(elem.find('.form-group').hasClass('has-success')).toBe(false);
      });

      it('should not reflect any state when the input is pristine again', function() {
        scope.someForm.someInput.$setViewValue('foo');
        scope.someForm.someInput.$setPristine();
        expect(elem.find('.form-group').hasClass('has-error')).toBe(false);
        expect(elem.find('.form-group').hasClass('has-success')).toBe(false);
      });



    });

  });

})();
