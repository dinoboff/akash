/* jshint camelcase: false*/
/* global describe, beforeEach, it, inject, expect, jasmine*/

(function() {
  'use strict';

  describe('oep.user.directives', function() {
    var compile, scope, httpBackend, elem, timeout;

    beforeEach(module('oep.user.directives'));

    beforeEach(inject(function(_$compile_, _$rootScope_, _$httpBackend_, $timeout) {
      compile = _$compile_;
      scope = _$rootScope_;
      httpBackend = _$httpBackend_;
      timeout = $timeout;
    }));

    describe('oepUniqId', function() {

      beforeEach(function() {
        jasmine.Clock.useMock();

        elem = compile(
          '<form name="form"><input ng-model="user.id" name="userId" oep-uniq-id="true"/>'
        )(scope);
      });

      it('should check if an entity with the same id exist', function() {
        httpBackend.expectGET('/api/v1/users/bob').respond(404, {});

        scope.form.userId.$setViewValue('bob');
        timeout.flush();
        httpBackend.flush();
      });

      it('should set model as invalid if an entity with the same id exist', function() {
        httpBackend.whenGET('/api/v1/users/bob').respond(200, {});

        scope.form.userId.$setViewValue('bob');
        timeout.flush();
        httpBackend.flush();

        expect(scope.form.userId.$invalid).toBe(true);
        expect(scope.form.userId.$error.oepUniqId).toBe(true);
      });

      it('should set model as valid if an entity with the same id doesn\'t exist', function() {
        httpBackend.whenGET('/api/v1/users/bob').respond(404, {});

        scope.form.userId.$setViewValue('bob');
        timeout.flush();
        httpBackend.flush();

        expect(scope.form.userId.$invalid).toBe(false);
        expect(scope.form.userId.$error.oepUniqId).toBe(false);
      });

    });

  });

})();