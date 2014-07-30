/* jshint camelcase: false*/
/* global describe, beforeEach, it, inject, expect */

(function() {
  'use strict';

  describe('oep.events.services', function() {
    var api, httpBackend;

    beforeEach(module('oep.events.services'));

    beforeEach(inject(function(_$httpBackend_) {
      httpBackend = _$httpBackend_;
    }));

    describe('oepEventsApi', function() {

      beforeEach(inject(function(oepEventsApi) {
        api = oepEventsApi;
      }));

      it('should query the list of event', function() {
        var results;

        httpBackend.expectGET('/api/v1/events').respond(
          '{"events":[], "cursor": ""}'
        );

        api.get().then(function(resp) {
          results = resp;
        });

        httpBackend.flush();

        expect(results.length).toBe(0);
        expect(results.cursor).toBe(null);
      });

      it('should return the list of event and the cursor', function() {
        var results;

        httpBackend.expectGET('/api/v1/events').respond(
          '{"events":[{"eventName":"My Event","schoolType":"Poly","count":1,"criteria":"Rescue Mission badge","service":"Code Combat","reward":"earn a letter of recommendation for university applications","comments":"Have fun.","from":"me@example.com"}], ' +
          '"cursor": "abcd"}'
        );

        api.get().then(function(resp) {
          results = resp;
        });

        httpBackend.flush();

        expect(results.length).toBe(1);
        expect(results.cursor).toBe('abcd');
      });

      it('should query event from a cursor', function() {
        httpBackend.expectGET('/api/v1/events?cursor=abcd').respond({});
        api.get('abcd');
        httpBackend.flush();
      });

      it('should post new events', function() {
        var data, event = {"eventName":"My Event","schoolType":"Poly","count":1,"criteria":"Rescue Mission badge","service":"Code Combat","reward":"earn a letter of recommendation for university applications","comments":"Have fun.","from":"me@example.com"};

        httpBackend.expectPOST('/api/v1/events').respond(function(m, u, body) {
          data = JSON.parse(body);
          return [200, data];
        });

        api.create(event);
        httpBackend.flush();

        expect(data).toEqual(suggestion);
      });

    });

  });

})();