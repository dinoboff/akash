/* jshint camelcase: false*/
/* global describe, beforeEach, it, inject, expect */

(function() {
  'use strict';

  describe('oep.user.services', function() {
    var $httpBackend, scope, rootScope, $http, bob, bobInfo, timeout;

    beforeEach(module('oep.user.services'));

    beforeEach(inject(function(_$httpBackend_, $rootScope, _$http_, _$timeout_) {
      $httpBackend = _$httpBackend_;
      scope = $rootScope.$new();
      rootScope = $rootScope;
      $http = _$http_;
      timeout = _$timeout_;

      bobInfo = {
        'name': 'Bob Coder',
        'id': 'bob',
        'services': {
          'codeSchool': {
            'id': '123456789'
          },
          'treeHouse': {
            'id': 'bobcoder'
          }
        }
      };
      bob = {
        'name': 'bob@example.com',
        'isAdmin': true,
        'isLoggedIn': true,
        'logoutUrl': '/logout',
        'info': bobInfo
      };
    }));

    describe('oepUserApi', function() {
      var currentUserApi;

      beforeEach(inject(function(oepCurrentUserApi) {
        currentUserApi = oepCurrentUserApi;
      }));

      it('should query the server for the current user', function() {
        var info;

        $httpBackend.expectGET(/\/api\/v1\/user\?returnUrl=.*/).respond(bob);

        currentUserApi.auth().then(function(_info) {
          info = _info;
        });
        $httpBackend.flush();

        expect(info.name).toBe('bob@example.com');
        expect(/https?:\/\/.+(:\d+)?\/\?ref=bob/.test(info.refUrl)).toBeTruthy();
      });

      it('should query the server for the current user and the logout url', function() {
        var info;

        $httpBackend.expectGET('/api/v1/user?returnUrl=%2Ffoo').respond(bob);

        currentUserApi.auth('/foo').then(function(_info) {
          info = _info;
        });
        $httpBackend.flush();
        expect(info.name).toBe('bob@example.com');

      });

      it('should return the log in url for logged off users', function() {
        var info;

        $httpBackend.expectGET('/api/v1/user?returnUrl=%2Ffoo').respond({
          'isAdmin': false,
          'isLoggedIn': false,
          'loginUrl': '/login'
        });

        currentUserApi.auth('/foo').then(function(_info) {
          info = _info;
        });
        $httpBackend.flush();
        expect(info.loginUrl).toBe('/login');

      });

      it('should fail if the server failed to return the login info', function() {
        var info;

        $httpBackend.expectGET('/api/v1/user?returnUrl=%2Ffoo').respond(function() {
          return [500, 'Server error'];
        });

        currentUserApi.auth('/foo').
        catch(function(_info) {
          info = _info;
        });
        $httpBackend.flush();
        expect(info.data).toBe('Server error');
        expect(info.status).toBe(500);

      });

      it('should merge concurrent requests', function() {
        var callCount = 0,
          users = [];

        $httpBackend.whenGET(/\/api\/v1\/user/).respond(function() {
          callCount++;
          return [200, bob];
        });

        function saveUser(user) {
          users.push(user);
          return user;
        }

        currentUserApi.auth().then(saveUser);
        currentUserApi.auth().then(saveUser);

        $httpBackend.flush();
        expect(callCount).toBe(1);

        expect(users.length).toBe(2);
        expect(users[0].name).toEqual('bob@example.com');
        expect(users[1].name).toEqual('bob@example.com');
        expect(users[0]).toBe(users[1]);
      });

      it('should not fetch user data again if already fetch', function() {
        var callCount = 0,
          users = [];

        $httpBackend.whenGET(/\/api\/v1\/user/).respond(function() {
          callCount++;
          return [200, bob];
        });

        function saveUser(user) {
          users.push(user);
          return user;
        }

        currentUserApi.auth().then(saveUser);
        $httpBackend.flush();
        currentUserApi.auth().then(saveUser);
        scope.$digest();
        expect(callCount).toBe(1);

        expect(users.length).toBe(2);
        expect(users[0].name).toEqual('bob@example.com');
        expect(users[1].name).toEqual('bob@example.com');
        expect(users[0]).toBe(users[1]);
      });

      it('should reset user after 401 resp to relative url', function() {
        $httpBackend.whenGET(/\/api\/v1\/user/).respond(bob);
        currentUserApi.auth();
        $httpBackend.flush();
        expect(currentUserApi.data.name).toEqual('bob@example.com');

        $httpBackend.whenGET('/api/v1/foo/').respond(function() {
          return [401, {}];
        });

        $http.get('/api/v1/foo/');
        $httpBackend.flush();

        expect(currentUserApi.data).toBe(null);
      });

      it('should reset user after 401 resp to a url to same domain', function() {
        $httpBackend.whenGET(/\/api\/v1\/user/).respond(bob);
        currentUserApi.auth();
        $httpBackend.flush();

        $httpBackend.whenGET(/http:\/\//).respond(function() {
          return [401, {}];
        });

        expect(currentUserApi.data.name).toEqual('bob@example.com');

        $http.get('http://server/foo/');
        $httpBackend.flush();

        expect(currentUserApi.data).toBe(null);
      });

      it('should not reset user after 401 resp to other domain', function() {
        $httpBackend.whenGET(/\/api\/v1\/user/).respond(bob);
        currentUserApi.auth();
        $httpBackend.flush();

        $httpBackend.whenGET(/http:\/\//).respond(function() {
          return [401, {}];
        });

        expect(currentUserApi.data.name).toEqual('bob@example.com');

        $http.get('http://example.com/api');
        $httpBackend.flush();

        expect(currentUserApi.data.name).toEqual('bob@example.com');
      });

      it('should keep user.loginUrl after 401 resp', function() {
        $httpBackend.whenGET(/\/api\/v1\/user/).respond({
          loginUrl: '/login'
        });
        currentUserApi.auth();
        $httpBackend.flush();

        expect(currentUserApi.data.loginUrl).toEqual('/login');

        $httpBackend.whenGET('/api/v1/foo/').respond(function() {
          return [401, {}];
        });

        $http.get('/api/v1/foo/');
        $httpBackend.flush();

        expect(currentUserApi.data.loginUrl).toEqual('/login');
      });

      it('should save the user info', function() {
        var data;

        $httpBackend.expectPUT('/api/v1/user').respond(function(m, u, body) {
          data = JSON.parse(body);
          return [200, null];
        });

        expect(currentUserApi.save(bobInfo).then).toBeDefined();
        $httpBackend.flush();
        expect(data).toEqual(bobInfo);
      });

      it('should remove extra properties when saving the user info', function() {
        var data;

        $httpBackend.expectPUT('/api/v1/user').respond(function(m, u, body) {
          data = JSON.parse(body);
          return [200, null];
        });

        bobInfo.foo = 'bar';
        bobInfo.services.totalScore = 1000;
        expect(currentUserApi.save(bobInfo).then).toBeDefined();
        $httpBackend.flush();
        expect(data.foo).not.toBeDefined();
        expect(data.services.totalScore).not.toBeDefined();

      });

    });

    describe('usersApi', function() {
      var usersApi;

      beforeEach(inject(function(oepUsersApi) {
        usersApi = oepUsersApi;
      }));

      it('should fetch a user by its id', function() {
        var data;

        $httpBackend.expectGET('/api/v1/users/bob').respond(bobInfo);

        usersApi.getById(bobInfo.id).then(function(_data_) {
          data = _data_;
        });

        $httpBackend.flush();
        expect(data.name).toEqual(bobInfo.name);
      });

      it('should query ranks', function() {
        var data;

        $httpBackend.expectGET('/api/v1/ranks').respond([]);

        usersApi.getRanks().then(function(_data_) {
          data = _data_;
        });

        $httpBackend.flush();
        expect(data.length).toBe(0);

      });

      it('should query summary', function() {
        var data;

        $httpBackend.expectGET('/api/v1/summary').respond({'schools':{'DHS':9},'genders':{'male':5}, 'services':{} });

        usersApi.getSummary().then(function(_data_) {
          data = _data_;
        });

        $httpBackend.flush();
        expect(data.schools.DHS).toBe(9);
        expect(data.genders.male).toBe(5);

      });

      it('should query ranks by badges', function() {
        $httpBackend.expectGET('/api/v1/ranks?sortBy=score').respond([]);
        usersApi.getRanks({
          sortBy: 'score'
        });
        $httpBackend.flush();
      });

      it('should update catched user stats', function() {
        $httpBackend.expectPOST('/api/v1/users/bob/stats').respond({});
        usersApi.updateStats('bob');
        timeout.flush();
        $httpBackend.flush();
      });

      it('should query the list of schools', function() {
        var resp;

        $httpBackend.expectGET('/api/v1/schools').respond([{
          id: '0',
          name: 'Other'
        }]);

        usersApi.availableSchools().then(function(_resp_) {
          resp = _resp_;
        });
        scope.$digest();
        $httpBackend.flush();

        expect(resp.length).toBe(1);
      });

      it('should query the list only once', function() {
        var queryCount = 0,
          resps = [],
          log = function(resp) {
            resps.push(resp);
          };

        $httpBackend.expectGET('/api/v1/schools').respond(function() {
          queryCount++;
          return [200, [{
            id: '0',
            name: 'Other'
          }]];
        });

        usersApi.availableSchools().then(log);
        usersApi.availableSchools().then(log);
        $httpBackend.flush();

        usersApi.availableSchools().then(log);
        rootScope.$digest();
        expect(queryCount).toBe(1);
        expect(resps.length).toBe(3);
        expect(resps[0]).toBe(resps[1]);
        expect(resps[0]).toBe(resps[2]);
      });

      it('should sort schools by name', function() {
        var resp;

        $httpBackend.expectGET('/api/v1/schools').respond([{
          id: '1',
          name: 'ZZZ'
        }, {
          id: '2',
          name: 'AAA'
        }]);

        usersApi.availableSchools().then(function(_resp_){
          resp = _resp_;
        });

        $httpBackend.flush();
        expect(resp[0].name).toBe('AAA');
      });

      it('should should sort schools but keep "other" as lost option', function() {
        var resp;

        $httpBackend.expectGET('/api/v1/schools').respond([{
          id: '1',
          name: 'ZZZ'
        }, {
          id: '2',
          name: 'AAA'
        }, {
          id: '0',
          name: 'Other'
        }]);

        usersApi.availableSchools().then(function(_resp_){
          resp = _resp_;
        });

        $httpBackend.flush();
        expect(resp[2].name).toBe('Other');
      });
    });
  });

})();