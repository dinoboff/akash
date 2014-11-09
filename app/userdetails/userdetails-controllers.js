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
    'oepDebounce',
    'user',
    'availableSchools',
    'availableCourses',
    function OepUserFormListCtrl($location, $q, $http, $scope,$filter, $window, oepCurrentUserApi, oepUsersApi, oepSettings, oepDebounce, user, availableSchools, availableCourses) {
      var $ = $window.jQuery,
        _ = $window._,
        search = $window.location.search,
        refPattern = /\?([^&]+&)*ref=([^&]+)(&.*)?/,
        match = refPattern.exec(search),
        self = this,
        pick = $filter('oepPick'),
        updaters = {},
        today=new Date(),
        nextYear=new Date(today.getFullYear() +1, 11, 31);

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
                  console.log('Code Combat data not found.\nError: '+response);
                }
              );
          };


      /**
       * Save/create user info.
       *
       */
      this.save = function(userInfo) {
        this.saving = $q.when(this.saving).then(function() {
          return oepCurrentUserApi.save(userInfo);
        }).then(function(user) {
          oepCurrentUserApi.reset();
          if (self.isNewUser) {
            $location.path('/');
          }
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
       * The update calls for each properties are debounced and will only be
       * sent when no concurrent call to update a property had been sent for
       * 1000 ms.
       *
       */
      this.update = function(userInfo, prop, input, form) {
        var updater = updaters[prop];

        if (self.isNewUser) {
          return;
        }

        if (updater) {
          updater(userInfo, prop, input, form);
          return;
        }

        updater = updaters[prop] = oepDebounce(function(userInfo, prop, input, form) {
          if (input.$invalid) {
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
        }, 1000);

        updater(userInfo, prop, input, form);
      };

      /**
       * Get Number of Pull Requests
       *
       * TODO: Move business logic to a service out of the controller.
       * TODO: should be debounced.
       */
      this.getPulls = function() {

        /**
        var repositories = [
          'https://api.github.com/repos/Khan/KaTex/pulls',
          'https://api.github.com/repos/Khan/khan-exercises/pulls'
        ];
        */
        var repository = 'https://api.github.com/repos/Khan/KaTex/stats/contributors';

        $http({
          method: 'JSONP',
          url: repository + '?callback=JSON_CALLBACK'
        }).then(function(response) {
            // success
            console.log(response.status);
            console.log(response.data.data[0]);
            var a = 0;
            var d = 0;
            var c = 0;
            for (var i = 0; i < response.data.data.length; i++){
              var username = response.data.data[i].author.login;
              if(username === self.user.info.services.github.id) {
                console.log(response.data.data[i]);
                for (var j = 0; j < response.data.data[i].weeks.length; j++){
                  a += response.data.data[i].weeks[j].a;
                  d += response.data.data[i].weeks[j].d;
                  c += response.data.data[i].weeks[j].c;
                }
              }
            }
            self.user.info.services.github.pulls = c;
            self.user.info.services.github.a = a;
            self.user.info.services.github.d = d;
          },
          function(response) { // optional
            // failed
            console.log(response.status);
            console.log('Github data not found.\nError: '+response);
          }
        );
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
