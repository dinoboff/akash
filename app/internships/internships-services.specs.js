/* jshint camelcase: false*/
/* global describe, beforeEach, it, inject, expect */

(function() {
  'use strict';

  describe('oep.internships.services', function() {
    var api, httpBackend;

    beforeEach(module('oep.internships.services'));

    beforeEach(inject(function(_$httpBackend_) {
      httpBackend = _$httpBackend_;
    }));

    describe('oepInternshipsApi', function() {

      beforeEach(inject(function(oepInternshipsApi) {
        api = oepInternshipsApi;
      }));

      it('should query the list of internships', function() {
        var results;

        httpBackend.expectGET('/api/v1/internships').respond(
          '{"internships":[], "cursor": ""}'
        );

        api.get().then(function(resp) {
          console.log('here2');
          results = resp;
        });

        httpBackend.flush();

        expect(results.length).toBe(0);
        expect(results.cursor).toBe(null);
      });

      it('should return the list of internships and the cursor', function() {
        var results;

        httpBackend.expectGET('/api/v1/internships').respond(
          '{"internships":[{"selectedValue": "Yes","selectedCompanies": "[Visa]","sDate":   "2014-11-11","eDate": "2014-12-12","notifications": "Yes","public": "Yes","user": "Chris"}], ' +'"cursor": "abcd"}');

        api.get().then(function(resp) {
          results = resp;
        });

        httpBackend.flush();

        expect(results.length).toBe(1);
        expect(results.cursor).toBe('abcd');
      });

      it('should query suggestion from a cursor', function() {
        httpBackend.expectGET('/api/v1/internships?cursor=abcd').respond({});
        api.get('abcd');
        //console.log(api.get('abcd')+here);
        httpBackend.flush();
      });

      it('should post new internships', function() {
        var data, internship = {'selectedValue': 'Yes', 'selectedCompanies':                         '[Visa]','sDate':'2014-09-09','eDate':'2014-12-12','notifications':'Yes',                       'public': 'yes','user':'chris'};

        httpBackend.expectPOST('/api/v1/internships').respond(function(m, u, body) {
          data = JSON.parse(body);
          return [200, data];
        });

        api.create(internship);
        httpBackend.flush();

        expect(data).toEqual(internship);
      });

    });

  });

})();