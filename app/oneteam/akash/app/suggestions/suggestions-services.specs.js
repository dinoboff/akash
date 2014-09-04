/* jshint camelcase: false*/
/* global describe, beforeEach, it, inject, expect */

(function() {
  'use strict';

  describe('oep.suggestions.services', function() {
    var api, httpBackend;

    beforeEach(module('oep.suggestions.services'));

    beforeEach(inject(function(_$httpBackend_) {
      httpBackend = _$httpBackend_;
    }));

    describe('oepSuggestionsApi', function() {

      beforeEach(inject(function(oepSuggestionsApi) {
        api = oepSuggestionsApi;
      }));

      it('should query the list of suggestion', function() {
        var results;

        httpBackend.expectGET('/api/v1/suggestions').respond(
          '{"suggestions":[], "cursor": ""}'
        );

        api.get().then(function(resp) {
          results = resp;
        });

        httpBackend.flush();

        expect(results.length).toBe(0);
        expect(results.cursor).toBe(null);
      });

      it('should return the list of suggestion and the cursor', function() {
        var results;

        httpBackend.expectGET('/api/v1/suggestions').respond(
          '{"suggestions":[{"from": "me@example.com", "message": "hi"}], ' +
          '"cursor": "abcd"}'
        );

        api.get().then(function(resp) {
          results = resp;
        });

        httpBackend.flush();

        expect(results.length).toBe(1);
        expect(results.cursor).toBe('abcd');
      });

      it('should query suggestion from a cursor', function() {
        httpBackend.expectGET('/api/v1/suggestions?cursor=abcd').respond({});
        api.get('abcd');
        httpBackend.flush();
      });

      it('should post new suggestions', function() {
        var data, suggestion = {'from': 'me@example.com', 'message': 'hi'};

        httpBackend.expectPOST('/api/v1/suggestions').respond(function(m, u, body) {
          data = JSON.parse(body);
          return [200, data];
        });

        api.create(suggestion);
        httpBackend.flush();

        expect(data).toEqual(suggestion);
      });

    });

  });

})();