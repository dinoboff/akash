/**
 * eop.card.services - Services for report card components.
 *
 * defines:
 *
 * - oepTreeHouseCourses
 * - oepTrackTreehouseCourses
 * - eopReportCardApi
 *
 */
(function() {
  'use strict';

  angular.module('eop.card.services', ['oep.services']).

  /**
   * oepTreeHouseCourses - List course available at Treehouse
   *
   * Contains its list of lesson, its url, name and icon url.
   *
   * TODO: Work in progress.
   *
   */
  factory('oepTreeHouseCourses', [
    function() {
      return function() {
        return [{
          name: 'How to Make a Website',
          url: 'http://teamtreehouse.com/library/how-to-make-a-website',
          iconUrl: 'https://wac.a8b5.edgecastcdn.net/80A8B5/achievement-images/flags/cover-html-howtobuildawebsite.png',
          iconColor: '#39ADD1',
          // TODO: get lesson ids.
          lessons: [
            'Beginning HTML and CSS',
            'HTML First',
            'Creating HTML Content',
            'CSS: Cascading Style Sheets',
            'Customizing Colors and Fonts',
            'Styling Web Pages and Navigation',
            'Adding Pages to a Website',
            'Responsive Web Design and Testing',
            'Sharing a Website',
            'Debugging HTML and CSS Problems'
          ],
          progress: 0,
          completed: false,
        }];
      };
    }
  ]).

  /**
   * oepTrackTreehouseCourses - Build the the list of course a user started
   * or completed from the badges he/she earned.
   *
   * Currently only support "How to Make a Website" course.
   *
   */
  factory('oepTrackTreehouseCourses', ['oepTreeHouseCourses',
    function(oepTreeHouseCourses) {
      return function(data) {
        var result = {
          completed: {},
          inProgress: {}
        };

        if (!data.badges || !data.badges.length) {
          return result;
        }

        data.badges.reduce(function(courses, badge) {
            courses.map(function(course) {
              if (course.lessons.indexOf(badge.name) > -1) {
                course.progress += 1;
              }
            });

            return courses;
          },
          oepTreeHouseCourses()
        ).map(function(course) {
          if (course.progress >= course.lessons.length) {
            course.completed = true;
          }
          return course;
        }).forEach(function(course) {
          if (course.completed) {
            result.completed[course.name] = course;
          } else if (course.progress > 0) {
            result.inProgress[course.name] = course;
          }
        });

        return result;
      };
    }
  ]).

  /**
   * eopReportCardApi - Client for Treehouse, Code House and OEP badge
   * tracking APIs
   *
   * TODO: The interface is the a mess and should be centered on the
   * OEP badge tracking API instead of Treehouse and Code House.
   *
   */
  factory('eopReportCardApi', ['$http', 'oepTrackTreehouseCourses', '$q', 'oepApi',
    function($http, oepTrackTreehouseCourses, $q, oepApi) {
      var api = {

        check: {
          /**
           * Check the tree house profile page exist for that user.
           *
           * Returns a promise resolving to True if the profile exist,
           * or false overwise.
           *
           */
          treeHouse: function(username) {
            var url = 'http://teamtreehouse.com/' + username + '.json';

            return $http.get(url).then(function() {
              return true;
            }).
            catch (function() {
              return false;
            });
          },

          /**
           * Check the code school profile page exist for that user and
           * if public.
           *
           * Returns a promise resolving to true if the profile exist,
           * or false overwise.
           *
           */
          codeSchool: function(username) {
            return oepApi.one('codeschool', username).get().then(function() {
              return true;
            }).
            catch (function() {
              return false;
            });
          },

          /**
           * Check the code combat user name exist.
           *
           * Returns a promise resolving to the user if if it does
           */
          codeCombat: function(username) {
            if (!username) {
              return $q.when(false);
            }

            return oepApi.one('codecombat', username).get().then(function(resp) {
              return resp.userId;
            }).
            catch (function() {
              return false;
            });
          }

        },

        consolidate: {
          /**
           * Convert treehouse data to OEP badges tracking schema.
           *
           */
          treeHouse: function(data) {
            /* jshint camelcase: false*/
            return {
              id: data.profile_name,
              badges: getTreeHouseBadges(data),
              courses: oepTrackTreehouseCourses(data),
              points: data.points.total
            };
          },

          /**
           * Convert Code School data to OEP badges tracking schema.
           *
           */
          codeSchool: function(data) {
            /* jshint camelcase: false*/
            return {
              id: data.user.username,
              badges: getCodeSchoolBadges(data),
              courses: {
                completed: getCodeSchoolCourses(data.courses.completed),
                inProgress: getCodeSchoolCourses(data.courses.in_progress)
              },
              points: data.user.total_score
            };
          }
        },

        /**
         * Return treehouse user report card data
         *
         */
        treeHouse: function(username) {
          var url = 'http://teamtreehouse.com/' + username + '.json';

          return $http.get(url).then(function(resp) {
            return api.consolidate.treeHouse(resp.data);
          });
        },

        /**
         * Return codeschool user report card data
         *
         */
        codeSchool: function(username) {
          var profileUrl = 'https://www.codeschool.com/users/' + username,
            url = profileUrl + '.json?callback=JSON_CALLBACK';

          return $http.jsonp(url).then(function(resp) {
            return api.consolidate.codeSchool(resp.data);
          });
        },

        /**
         * Return a promise resolving to true if the badges tracked
         * by OEP API are out of date with the user's Treehouse and/or
         * Code School profiles.
         *
         */
        checkStats: function(stats) {
          return $q.all([
            this._checkHouseStats(stats.treeHouse),
            this._checkCodeSchoolStats(stats.codeSchool)
          ]).then(function(result) {
            for (var i = 0; i < result.length; i++) {
              if (result[i]) {
                return true;
              }
            }
            return false;
          });
        },

        _checkHouseStats: function(details) {
          if (!details || !details.id) {
            return $q.when(false);
          }

          return this.treeHouse(details.id).then(function(info) {
            return (
              (info.badges && !details.badges) ||
              (info.courses && !details.courses) ||
              info.points !== details.points ||
              info.badges.length !== details.badges.length ||
              info.courses.inProgress.length !== details.courses.inProgress.length ||
              info.courses.completed.length !== details.courses.completed.length
            );
          });
        },

        _checkCodeSchoolStats: function(details) {
          if (!details || !details.id) {
            return $q.when(false);
          }

          return this.codeSchool(details.id).then(function(info) {
            return (
              (info.badges && !details.badges) ||
              (info.courses && !details.courses) ||
              info.points !== details.points ||
              info.badges.length !== details.badges.length ||
              info.courses.inProgress.length !== details.courses.inProgress.length ||
              info.courses.completed.length !== details.courses.completed.length
            );
          });
        }
      };

      return api;
    }
  ])

  ;

  /**
   * Date -> string.
   *
   */
  function formatDate(date) {
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      d = new Date(date);

    return monthNames[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  /**
   * Convert Treehouse badge data to OEP API schemas
   *
   */
  function parseTreeHouseBadge(badge) {
    /* jshint camelcase: false*/
    return {
      'id': badge.id,
      'name': badge.name,
      'earnedDate': formatDate(badge.earned_date),
      'iconUrl': badge.icon_url
    };
  }

  /**
   * Convert Code Course badge data to OEP API schemas.
   *
   */
  function parseSchoolBadges(badge) {
    /* jshint camelcase: false*/
    return {
      name: badge.name,
      iconUrl: badge.badge,
      url: badge.course_url
    };
  }

  /**
   * Extract badges out of the Treehouse data.
   *
   */
  function getTreeHouseBadges(data) {
    var badges;

    badges = _getBadges(data);
    return badges.map(parseTreeHouseBadge);
  }

  /**
   * Extract badges out of the Code School data.
   *
   */
  function getCodeSchoolBadges(data) {
    return _getBadges(data).map(parseSchoolBadges);
  }

  function _getBadges(data) {
    if (!data.badges || !data.badges.length) {
      return [];
    } else {
      return data.badges;
    }
  }

  /**
   * Convert Code School courses data to OEP API schemas
   *
   */
  function parseSchoolCourses(course) {
    return {
      name: course.title,
      iconUrl: course.badge,
      url: course.url
    };
  }

  /**
   * Extract courses out of code course profile data.
   *
   */
  function getCodeSchoolCourses(courses) {
    var result = {};

    courses.map(parseSchoolCourses).forEach(function(course) {
      result[course.name] = course;
    });

    return result;
  }

})();