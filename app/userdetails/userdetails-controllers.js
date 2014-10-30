/**
 * oep.userdetails.controllers - Module for userdetails subsection controllers.
 *
 * Defines:
 *
 * - OepUserCtrl
 */

(function() {
  'use strict';

  var googleNickNamePattern = /([^@]+)(@.+)?/,
    userIdFilterPattern = /[^-\w\d.]/g,
    module = angular.module('oep.userdetails.controllers', [
      'oep.config',
      'oep.user.services',
      'eop.card.directives',
      'eop.card.services',
      'oep.debounce.services',
      'oep.utils.filters'
    ]);


  /**
   * Convert a name to an id.
   *
   */
  function defaultId(name) {
    var n = defaultName(name);
    return n.replace(userIdFilterPattern, '');
  }


  /**
   * Convert a gmail account nickname to a name.
   */
  function defaultName(name) {
    return googleNickNamePattern.exec(name)[1];
  }


  function _pad(number) {
    var r = number + '';

    if (r.length === 1) {
      r = '0' + r;
    }

    return r;
  }


  /**
   * Return an ISO date
   */
  function isoDate(date) {
    date = date || new Date();

    return date.getUTCFullYear() +
      '-' + _pad(date.getUTCMonth() + 1) +
      '-' + _pad(date.getUTCDate());
  }

  /**
   * OepUserCtrl - Controller for the user profile page.
   *
   * Requires the current user info which it uses to populate the scope
   * `profile` property.
   *
   * It will also check that the badge info are up to date.
   *
   */
  module.controller('OepUserCtrl', [
    '$timeout',
    'oepUsersApi',
    'eopReportCardApi',
    'oepCurrentUserApi',
    'user',
    function OepUserCtrl($timeout, oepUsersApi, eopReportCardApi, oepCurrentUserApi, user) {
      var self = this,
        retryDelay = 2000;

      this.profile = user;
      this.currentUser = null;

      if (!user || !user.services) {
        return;
      }

      oepCurrentUserApi.auth().then(function(info) {
        self.currentUser = info;
      });

      /**
       * Check the user badges data are out of date and query the server
       * for new ones if they are.
       *
       */
      this.checkBadges = function(services) {

        eopReportCardApi.checkStats(services).then(function(shouldUpdate) {
          if (!shouldUpdate) {
            return;
          }

          $timeout(function() {
            return oepUsersApi.getById(self.profile.id).then(function(info) {
              self.profile.services = info.services;
              self.checkBadges(info.services);
            });
          }, retryDelay);

          retryDelay *= 4;
        });
      };

      this.checkBadges(user.services);
    }
  ]);

  /**
   * OepUserFormListCtrl - Controller for the user settings form.
   *
   * TODO: move the logic to extract the referrer out into a service.
   *
   */
  module.controller('OepUserFormListCtrl', [
    '$location',
    '$q',
    '$http',
    '$scope',
    '$filter',
    '$window',
    'oepCurrentUserApi',
    'oepUsersApi',
    'oepSettings',
    'user',
    'availableSchools',
    'availableCourses',
    function OepUserFormListCtrl($location, $q, $http, $scope, $filter, $window, oepCurrentUserApi, oepUsersApi, oepSettings, user, availableSchools, availableCourses) {
      var $ = $window.jQuery,
        _ = $window._,
        search = $window.location.search,
        refPattern = /\?([^&]+&)*ref=([^&]+)(&.*)?/,
        match = refPattern.exec(search),
        self = this,
        pick = $filter('oepPick'),
        today = new Date(),
        nextYear = new Date(today.getFullYear() + 1, 11, 31);

      this.asyncOptions = {
        updateOn: 'default blur',
        debounce: {
          'default': 1000,
          'blur': 0
        }
      };
      this.normalOptions = {
        updateOn: 'default change blur',
        debounce: {
          'default': 300,
          'change': 300,
          'blur': 0
        }
      };

      this.saving = false;
      this.userIdPattern = /^[-\w\d.]+$/;
      this.isNewUser = !user.info;
      this.user = $.extend({}, user);
      this.ref = match && match.length > 2 ? match[2] : null;
      this.options = $.extend({}, oepSettings.userOptions);
      this.options.schools = {
        choices: availableSchools
      };
      this.today = isoDate(today);
      this.nextYear = isoDate(nextYear);

      this.newCourse = {
        selected: {},
        allCourses: availableCourses,
        available: _.filter(availableCourses, function(course) {
          if (!user.info || !user.info.courses) {
            return course;
          }
          return !_.find(user.info.courses, {
            id: course.id
          });
        })
      };
      this.defaultCompanies = [
        'Accenture', 'Amazon', 'Carousel', 'Cisco', 'Facebook',
        'Google', 'HP', 'IBM', 'Neo', 'Nitrous.io', 'PayPal',
        'RevolutionR', 'Salesforce', 'SAP', 'SAS', 'Singtel',
        'Viki', 'Visa'
      ];

      /**
       * reset new user values.
       *
       */
      this.newUserInfo = function() {
        this.user.info = {};
        if (this.ref) {
          this.user.info.referredBy = this.ref;
        }
      };

      /**
       * Fetch the code combat username of the current user and update
       * userInfo.services.codeCombat.name with it.
       *
       * The user should be logged in on Code Combat.
       *
       * TODO: Move business logic to a service out of the controller.
       */
      this.checkForCodecombat = function(userInfo, prop, input, form) {
        $http({
          url: 'http://codecombat.com/auth/whoami?callback=JSON_CALLBACK',
          method: 'JSONP'
        }).then(function(response) {
            // success
            userInfo.services = userInfo.services || {};
            userInfo.services.codeCombat = userInfo.services.codeCombat || {};
            userInfo.services.codeCombat.name = response.data.name;
            self.update(userInfo, prop, input, form);
          },
          function(response) { // optional
            // failed
            console.log('Code Combat data not found.\nError: ' + response);
          }
        );
      };


      /**
       * Create new user.
       *
       */
      this.save = function(userInfo) {
        if (!self.isNewUser) {
          return;
        }

        this.saving = $q.when(this.saving).then(function() {
          return oepCurrentUserApi.save(userInfo);
        }).then(function(user) {
          oepCurrentUserApi.reset();
          $location.path('/');
          return user;
        })['finally'](function() {
          self.saving = false;
        });

        return this.saving;
      };

      function setFormPristine(form) {
        var isPristine = true;

        _.keys(form).forEach(function(key) {
          if (key[0] === '$') {
            return;
          }

          if (form[key].$addControl) {
            setFormPristine(form[key]);
          }

          if (form[key].$dirty) {
            isPristine = false;
          }
        });

        if (isPristine) {
          form.$setPristine();
        }
      }

      /**
       * Update some attributes of the user info.
       *
       */
      this.update = function(userInfo, prop, input, form) {
        if (self.isNewUser) {
          return;
        }

        if (!input.$valid) {
          return;
        }

        self.saving = $q.when(self.saving).then(function() {
          var payload = pick(userInfo, prop);

          return oepCurrentUserApi.update(payload);
        }).then(function(user) {
          input.$setPristine();
          setFormPristine(form);
          return user;
        })['finally'](function() {
          self.saving = false;
        });
      };

      /**
       * Get Number of Pull Requests
       *
       * TODO: Move business logic to a service out of the controller.
       * TODO: should be debounced.
       */
      this.getPulls = function() {
        var self = this;

        this.user.info.services.github.pulls = 0;

        /**
        var repositories = [
          'https://api.github.com/repos/Khan/KaTex/pulls',
          'https://api.github.com/repos/Khan/khan-exercises/pulls'
        ];
        */
        var repository = 'https://api.github.com/repos/Khan/KaTex/pulls';

        $http({
          method: 'JSONP',
          url: repository + '?state=closed' + '&callback=JSON_CALLBACK'
        }).then(function(response) {
            // success
            console.log(response.data.length);
            self.user.info.services.github.pulls = response.data.length;
          },
          function(response) { // optional
            // failed
            console.log(response.status);
            console.log('Github data not found.\nError: ' + response);
          }
        );

        /**
        var xhr = new XMLHttpRequest();

        xhr.open('GET', 'https://api.github.com/repos/Khan/KaTex/pulls?state=closed', false);
        xhr.setRequestHeader('Authorization', 'Basic YWthc2hrZWRpYTpIYXNBSzk2NzQz');

        xhr.send('');
        var data = xhr.responseText;
        console.log(data.length);
        self.user.info.services.github.pulls = (data.split('"login": "'+self.user.info.services.github.id+'",').length - 1) / 3;
        */
      };

      /**
       * Join a course.
       *
       */
      this.addCourse = function(course, pwField) {
        oepUsersApi.courses.join(course, this.user.info).then(function(result) {
          delete course.id;
          delete course.pw;
          self.user.info.courses.push(result);
          self.newCourse.available = _.remove(
            self.newCourse.available, {
              id: result.id
            }
          );
        }).catch(function(resp) {
          if (resp.status === 403) {
            pwField.$setValidity('wrongPassword', false);
          } else {
            $window.alert('Failed to register you to the course.');
          }
        });
      };

      /**
       * Count companies
       *
       */
      this.maxedIntership = function(companies) {
        var count = _.reduce(companies, function(sum, selected) {
          return selected ? sum + 1 : sum;
        }, 0);
        return count >= 5;
      };

      /**
       * Test if the maximum number of internship comp
       *
       */

      /** init **/

      if (!this.user.info) {
        this.newUserInfo();
      }

      _.defaults(this.user.info, {
        'internship': {},
        'id': defaultId(user.name),
        'name': defaultName(user.name)
      });

      _.defaults(this.user.info.internship, {
        'interested': false,
        'companies': {},
        'dates': _.range(2).map(function() {
          return {
            start: '',
            end: ''
          };
        }),
        'notification': {}
      });
    }
  ]);


  /**
   * Summary controller
   *
   * TODO: Unrelated to user profile. Should be moved to its own module.
   */
  module.controller('SummaryController', ['oepUsersApi',
    function SummaryController(oepUsersApi) {
      var self = this;

      oepUsersApi.getSummary().then(function(summary) {
        self.summary = summary;
      });
    }
  ]);

})();
