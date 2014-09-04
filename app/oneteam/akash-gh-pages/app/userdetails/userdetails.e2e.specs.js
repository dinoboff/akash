/**
 * userdetails subsection e2e tests.
 *
 * TODO: share urls with app.js
 * TODO: share e2e ablolute url with other e2e tests.
 *
 */

/* jshint camelcase: false*/
/* global describe, protractor, it, browser, element, by, expect, takeScreenShot */

(function() {
  'use strict';

  describe('OEP setting page', function() {

    var ptor = protractor.getInstance(),

      httpBackendMock = function() {
        angular.module('httpBackendMock', ['ngMockE2E', 'oep', 'oep.fixtures'])

          /**
           * Mock API requests.
           *
           */
          .run(function($httpBackend, OEP_FIXTURES, $window, eopReportCardApi) {
            var fix = OEP_FIXTURES,
              users = fix.users, // List of user info,
              chrisId = null, // Id of Chris, our logged in user
              _ = $window._,
              updateBadges = function(id) {
                if (
                  users[id].services &&
                  users[id].services.codeSchool &&
                  users[id].services.codeSchool.id &&
                  fix.profiles.codeSchool[users[id].services.codeSchool.id]
                ) {
                  users[id].services.codeSchool = eopReportCardApi.consolidate.codeSchool(
                    fix.profiles.codeSchool[users[id].services.codeSchool.id]
                  );
                }

                if (
                  users[id].services &&
                  users[id].services.treeHouse &&
                  users[id].services.treeHouse.id &&
                  fix.profiles.treeHouse[users[id].services.treeHouse.id]
                ) {
                  users[id].services.treeHouse = eopReportCardApi.consolidate.treeHouse(
                    fix.profiles.treeHouse[users[id].services.treeHouse.id]
                  );
                }
              };

            // Login
            $httpBackend.whenGET(fix.url.user).respond(function() {
              var result;

              if (!chrisId) {
                return [200, fix.newChris];
              } else {
                result = _.cloneDeep(users[chrisId]);
                updateBadges(chrisId);
                return [200, fix.chris(result)];
              }
            });

            // school list
            $httpBackend.whenGET(fix.url.schools).respond(fix.schoolList);

            // Updating logged user's info
            $httpBackend.whenPUT(fix.url.user).respond(function(_, __, rawData) {
              var data = JSON.parse(rawData);

              chrisId = data.id;
              fix.newChris.name = data.name;

              data.email = fix.newChris.email;
              data.gravatar = fix.gravatar;
              if (!data.services) {
                data.services = {};
              }

              users[data.id] = data;
              return [200, null];
            });

            // Users info
            $httpBackend.whenGET(fix.url.users).respond(function(m, url) {
              var match = fix.url.users.exec(url),
                id = match ? match[1] : null;

              console.log(id);
              if (!id || !users[id]) {
                return [404, fix.notFound];
              } else {
                return [200, users[id]];
              }
            });

            // Code school id validation
            $httpBackend.whenGET(fix.url.codeSchoolCheck).respond(function(m, url) {
              var match = fix.url.codeSchoolCheck.exec(url),
                id = match ? match[1] : null;

              if (!id) {
                return [404, fix.notFound];
              }

              if (fix.profiles.codeSchool[id]) {
                return [200, {
                  exist: true
                }];
              } else {
                return [404, fix.notFound];
              }
            });

            // Code School profile
            $httpBackend.whenJSONP(fix.url.codeSchool).respond(function(m, url) {
              var match = fix.url.codeSchool.exec(url),
                id = match ? match[1] : null;

              if (!id) {
                return [404, fix.notFound];
              }

              if (fix.profiles.codeSchool[id]) {
                return [200, fix.profiles.codeSchool[id]];
              } else {
                return [404, fix.notFound];
              }

            });

            // Treehouse profile
            $httpBackend.whenGET(fix.url.treeHouse).respond(function(m, url) {
              var match = fix.url.treeHouse.exec(url),
                id = match ? match[1] : null;

              if (!id) {
                return [404, fix.notFound];
              }

              if (fix.profiles.treeHouse[id]) {
                return [200, fix.profiles.treeHouse[id]];
              } else {
                return [404, fix.notFound];
              }
            });

            function parseQuery(q) {
              var params = {};

              q.split('&').forEach(function(pair) {
                var parts = pair.split('=');
                params[parts[0]] = parts[1];
              });

              return params;
            }

            // Courses
            $httpBackend.whenGET(fix.url.courses).respond(function(m, url) {
              var query = fix.url.courses.exec(url)[1] || '',
                params = parseQuery(query),
                courses;

              console.log('GET ' + url);

              if (params.opened) {
                courses = _(fix.courses).filter({opened: true});
              } else {
                courses = _(fix.courses);
              }

              var resp = {
                courses: courses.omit('pw').map().value(),
                cursor: null
              };

              return [200, resp];
            });

            $httpBackend.whenGET(/.*/).passThrough();
          });
      },

      SettingPage = function() {
        this.url = 'http://0.0.0.0:5557/#/edit';
        this.idInput = element(by.model('ctrl.user.info.id'));
        this.idUniqError = element(by.css('.id-uniq-error'));
        this.nameInput = element(by.model('ctrl.user.info.id'));
        this.femaleInput = element(by.css('#user-gender-female'));
        this.maleInput = element(by.css('#user-gender-male'));
        this.yearSelect = element(by.model('ctrl.user.info.yearOfBirth'));
        this.schoolSelect = element(by.model('ctrl.user.info.school'));
        this.codeSchoolInput = element(by.model('ctrl.user.info.services.codeSchool.id'));
        this.treeHouseInput = element(by.model('ctrl.user.info.services.treeHouse.id'));
        this.saveButton = element(by.partialButtonText('Save'));

        this.get = function() {
          return browser.get(this.url);
        };

        this.setName = function(name) {
          this.nameInput.clear();
          return this.nameInput.sendKeys(name);
        };

        this.setId = function(id) {
          this.idInput.clear();
          return this.idInput.sendKeys(id);
        };

        this.setGenre = function(genre) {
          if (genre === 'male') {
            return this.maleInput.click();
          } else {
            return this.femaleInput.click();
          }
        };

        this.setYearOfBirth = function(yearIndex) {
          return this.yearSelect.all(by.tagName('option')).then(function(options){
            return options[yearIndex].click();
          });
        };

        this.setSchool = function(schoolIndex) {
          return this.schoolSelect.all(by.tagName('option')).then(function(options){
            return options[schoolIndex].click();
          });
        };

        this.setCodeSchoolId = function(id) {
          this.codeSchoolInput.clear();
          return this.codeSchoolInput.sendKeys(id);
        };

        this.setTreeHouseId = function(id) {
          this.treeHouseInput.clear();
          return this.treeHouseInput.sendKeys(id);
        };

        this.save = function() {
          return this.saveButton.click();
        };
      },

      ProfilePage = function() {
        this.url = 'http://0.0.0.0:5557/#/';
        this.profileTitle = element(by.binding('ctrl.profile.name'));
        this.editLink = element(by.css('.edit-link'));
        this.reportCard = {
          codeSchool: element(by.css('.report-card.codeschool')),
          treeHouse: element(by.css('.report-card.treehouse'))
        };

        this.get = function() {
          return browser.get(this.url);
        };
      };

    ptor.addMockModule('httpBackendMock', httpBackendMock);

    it('should use the gmail nickname as default value', function() {
      var page = new SettingPage();

      page.get();
      expect(page.idInput.getAttribute('value')).toBe('chris');
      expect(page.nameInput.getAttribute('value')).toBe('chris');
      takeScreenShot('register-1');
    });

    it('should display an error if the id is taken', function() {
      var page = new SettingPage();

      page.get();
      page.setId('dinoboff');
      expect(page.idUniqError.isDisplayed()).toBeTruthy();
    });

    it('should disable save button if the name is not selected', function() {
      var page = new SettingPage();

      page.get();
      page.setName('');
      expect(page.saveButton.getAttribute('disabled')).toBeTruthy();
    });

    it('should redirect the newly registered user to his/her profile page', function() {
      var settingPage = new SettingPage(),
        profilePage = new ProfilePage();

      settingPage.get();
      settingPage.setGenre('male');
      settingPage.setYearOfBirth(1);
      settingPage.setSchool(4);
      takeScreenShot('register-2');
      settingPage.save();
      takeScreenShot('register-3');
      expect(browser.getLocationAbsUrl()).toBe(profilePage.url);
      expect(profilePage.profileTitle.getText()).toBe('Hello chris');
    });

    it('should let a user add his code school id', function() {
      var settingPage = new SettingPage(),
        profilePage = new ProfilePage();

      settingPage.get();
      settingPage.setGenre('male');
      settingPage.setYearOfBirth(1);
      settingPage.setSchool(4);
      settingPage.save();
      profilePage.editLink.click();

      settingPage.setCodeSchoolId('ChrisBoesch');
      takeScreenShot('register-4');
      settingPage.save();
      takeScreenShot('register-5');


      expect(browser.getLocationAbsUrl()).toBe(profilePage.url);
      expect(profilePage.reportCard.codeSchool.isDisplayed()).toBeTruthy();
    });

    it('should let a user add his treehouse id', function() {
      var settingPage = new SettingPage(),
        profilePage = new ProfilePage();

      settingPage.get();
      settingPage.setGenre('male');
      settingPage.setYearOfBirth(1);
      settingPage.setSchool(4);
      settingPage.save();
      profilePage.editLink.click();

      settingPage.setTreeHouseId('chrisboesch');
      takeScreenShot('register-6');
      settingPage.save();
      takeScreenShot('register-7');

      expect(browser.getLocationAbsUrl()).toBe(profilePage.url);
      expect(profilePage.reportCard.treeHouse.isDisplayed()).toBeTruthy();
    });

  });

})();
