/**
 * oep.user.services - Services for the user components.
 *
 * Defines:
 *
 * - oepUsersApi
 * - oepCurrentUserApi
 *
 * It also defines and install a http interceptor to to reset info about
 * the current user when angular http backend receives a 401 error code
 * the OEP API server.
 *
 */
(function() {
  'use strict';
  var api;

  /**
   * Returns the origin attribute of location or the equivalent
   * if location doesn't defines it.
   *
   */
  function origin(location) {
    if (location.origin) {
      return location.origin;
    }

    return location.protocol +
      '//' + location.hostname +
      (location.port ? ':' + location.port : '');

  }

  /**
   * Returns a referral url.
   *
   * TODO: defines in that modules how to extract the referrer from a URL.
   *
   */
  function refUrl(userId, location) {
    return origin(location) + '/?ref=' + userId;
  }

  angular.module('oep.user.services', ['oep.services', 'oep.debounce.services']).

  /**
   * oepUsersApi - Client fro OEP user api.
   *
   */
  factory('oepUsersApi', ['oepApi', 'oepDebounce', '$q', '$window',
    function(oepApi, debounce, $q) {
      var updatePromises = {},
        schoolsPromise = null,
        schools = null;

      return {

        /**
         * Fetch the info for the user (defined by it his/her id)
         */
        getById: function(id) {
          return oepApi.one('users', id).get().then(function(info) {
            return info;
          });
        },

        /**
         * Get top 25 user ranks
         *
         */
        getRanks: function(filterBy) {
          return oepApi.all('ranks').getList(filterBy);
        },

        //Chris attempt at adding Restacular endpoint.
        getSummary: function() {
          //return oepApi.all('summary').getList();
          //return oepApi.one('summary').get();
          // Just ONE GET to /accounts/123/buildings/456
          return oepApi.one('summary').get();

        },
        /**
         * Request the users badges info to be updated.
         *
         * TODO: rename it to updateBagdes.
         *
         */
        updateStats: function(id) {
          if (!updatePromises[id]) {
            updatePromises[id] = debounce(function(id) {
              return oepApi.one('users', id).one('stats').post();
            }, 2000);
          }

          return updatePromises[id](id);
        },

        /**
         * Fetch list of available schools a user can register to.
         *
         * Return a promise resolving to the list of schools.
         *
         */
        availableSchools: function() {
          if (schools) {
            return $q.when(schools);
          }

          if (schoolsPromise) {
            return $q.when(schoolsPromise);
          }

          schoolsPromise = oepApi.all('schools').getList().then(function(resp) {
            schools = resp.sort(function(a, b) {
              // schools with an id equal to '0' should be last
              if (a.id === '0' && b.id === '0') {
                return 0;
              } else if (a.id === '0') {
                return 1;
              } else if (b.id === '0') {
                return -1;
              }

              // rest, sort by alphabetic order
              if (a.name > b.name) {
                return 1;
              } else if (a.name < b.name) {
                return -1;
              } else {
                return 0;
              }
            });

            return schools;
          });

          return schoolsPromise;
        },

        courses: {
          all: function(opened) {
            var params = {};

            if (opened) {
              params.opened = true;
            }

            return oepApi.all('courses').getList(params);
          },

          add: function(course) {
            return oepApi.all('courses').post(course);
          },

          open: function(course) {
            return oepApi.one('courses', course.id).one('opened').put().then(function() {
              course.opened = true;
            });
          },

          close: function(course) {
            return oepApi.one('courses', course.id).one('closed').put().then(function() {
              course.opened = false;
            });
          },

          testPassword: function(courseId, password) {
            return oepApi.one('courses', courseId).all('password').post({
              id: courseId,
              pw: password
            });
          },

          join: function(course, user) {
            return oepApi.one('courses', course.id).all('participants').post({
              id: course.id,
              userId: user.id,
              pw: course.pw
            }).then(function(result) {
              return result.course;
            });
          }
        }
      };
    }
  ]).

  /**
   * oepCurrentUserApi - api to access the current user data.
   *
   * oepCurrentUserApi.get(returnUrl)  Return the user name, id and the
   * the logout url if the user logged in. Return the login url if the
   * user logged off.
   *
   * Note that it returns a promise that resole in either case. If the promise
   * fails, there was either a problem with the optional return url, or
   * there's an unexpected issue with the backend.
   *
   */
  factory('oepCurrentUserApi', ['$location', '$q', 'oepApi', '$window',
    function($location, $q, oepApi, window) {
      var _ = window._;

      api = {
        data: null,
        loading: null,

        _get: function(returnUrl) {
          var params = {
            returnUrl: (
              returnUrl ||
              $location.absUrl()
            )
          };

          return oepApi.one('user').get(params).then(function(data) {
            return data;
          });
        },

        /**
         * Authenticate the user.
         *
         * Returns a promise resolving to the login status of the current
         * user with its info (if he registered).
         *
         */
        auth: function(returnUrl) {

          if (api.data) {
            return $q.when(api.data);
          }

          if (api.loading) {
            return api.loading;
          }


          api.loading = api._get(returnUrl).then(function(user) {
            if (user && user.info && user.info.id) {
              user.refUrl = refUrl(user.info.id, window.location);
            }

            api.data = user;
            return user;
          })['finally'](function() {
            api.loading = null;
          });

          return api.loading;
        },

        /**
         * Update the current user data.
         *
         */
        save: function(data) {
          var info = _.pick(
            data, ['id', 'name', 'gender', 'yearOfBirth', 'school', 'services', 'internship']
          );

          info.services = _.pick(
            info.services, ['treeHouse', 'codeSchool', 'codeCombat']
          );

          return oepApi.one('user').customPUT(info);
        },

        /**
         * Update one or many of the user properties
         *
         */
        update: function(info) {
          return oepApi.one('user').customPOST(info);
        },

        /**
         * Reset the cached user info data.
         *
         * Should be used when we know the info are outdated or when
         * the user is logged off.
         *
         */
        reset: function(loginUrl, msg) {
          var currentLoginUrl = api.data && api.data.loginUrl || null;

          loginUrl = loginUrl || currentLoginUrl;
          if (loginUrl) {
            api.data = {
              loginUrl: loginUrl,
              error: msg
            };
          } else {
            api.data = null;
          }
        }
      };

      return api;
    }
  ]).

  /**
   * Intercept http response error to reset oepCurrentUserApi on http
   * 401 response.
   *
   */
  factory('oepCurrentHttpInterceptor', ['$q', '$location',
    function($q, $location) {
      var httpPattern = /https?:\/\//,
        thisDomainPattern = new RegExp(
          'https?://' + $location.host().replace('.', '\\.')
        );

      function isSameDomain(url) {
        return !httpPattern.test(url) || thisDomainPattern.test(url);
      }

      return {
        responseError: function(resp) {
          if (
            resp.status === 401 &&
            isSameDomain(resp.config.url)
          ) {
            api.reset(resp.data.loginUrl, resp.data.error);
          }

          return $q.reject(resp);
        }
      };
    }
  ]).

  /**
   * Configure angular http backend to add oepCurrentHttpInterceptor
   * as interceptor.
   */
  config(['$httpProvider',
    function($httpProvider) {
      $httpProvider.interceptors.push('oepCurrentHttpInterceptor');
    }
  ])

  ;


})();