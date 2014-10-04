/**
 * Mock the api responses.
 *
 * Uses to intercept request to the api and set predefined responses
 *
 */

(function() {
  'use strict';

  function parseQuery(q) {
    var params = {};

    q.split('&').forEach(function(pair) {
      var parts = pair.split('=');
      params[parts[0]] = parts[1];
    });

    return params;
  }


  angular.module('oepMocked', ['oep', 'ngMockE2E', 'oep.fixtures', 'eop.card.services']).

  run(['$httpBackend', 'OEP_FIXTURES', '$window', 'eopReportCardApi',
    function(httpBackend, fixtures, window, reportCardApi) {
      var users = fixtures.users, // List of user info,
        suggestions = [],
        events = [],
        chrisId = null, // Id of Chris, our logged in user.
        _ = window._,
        updateBadges = function(id) {
          if (
            users[id].services &&
            users[id].services.codeSchool &&
            users[id].services.codeSchool.id &&
            fixtures.profiles.codeSchool[users[id].services.codeSchool.id]
          ) {
            users[id].services.codeSchool = reportCardApi.consolidate.codeSchool(
              fixtures.profiles.codeSchool[users[id].services.codeSchool.id]
            );
          }

          if (
            users[id].services &&
            users[id].services.treeHouse &&
            users[id].services.treeHouse.id &&
            fixtures.profiles.treeHouse[users[id].services.treeHouse.id]
          ) {
            users[id].services.treeHouse = reportCardApi.consolidate.treeHouse(
              fixtures.profiles.treeHouse[users[id].services.treeHouse.id]
            );
          }
        },
        detailledServices = function(user) {
          var s = _.cloneDeep(user.services),
            score = 0,
            totalBadges = 0;

          if (s.codeSchool && s.codeSchool.badges) {
            totalBadges += s.codeSchool.badges.length;
          }

          if (s.treeHouse) {
            if (s.treeHouse.badges) {
              totalBadges += s.treeHouse.badges.length;
            }
            if (s.treeHouse.points) {
              score += s.treeHouse.points;
            }
          }

          s.id = user.id;
          s.name = user.name;
          s.score = score;
          s.totalBadges = totalBadges;
          return s;
        };

      // Login
      httpBackend.whenGET(fixtures.url.user).respond(function() {
        var result;

        if (!chrisId) {
          return [200, fixtures.newChris];
        } else {
          result = _.cloneDeep(users[chrisId]);
          result.services = detailledServices(result);
          updateBadges(chrisId);
          return [200, fixtures.chris(result)];
        }
      });

      // Save logged user's info
      httpBackend.whenPUT(fixtures.url.user).respond(function(_, __, rawData) {
        var data = JSON.parse(rawData);

        chrisId = data.id;
        fixtures.newChris.name = data.name;

        data.email = fixtures.newChris.email;
        data.gravatar = fixtures.gravatar;
        if (!data.services) {
          data.services = {};
        }

        if (!data.courses) {
          data.courses = [];
        }

        users[data.id] = data;
        return [200, null];
      });

      // update logged user's info
      httpBackend.whenPOST(fixtures.url.user).respond(function(m, u, rawData) {
        var data = JSON.parse(rawData), result;

        users[chrisId] = _.merge(users[chrisId], data);

        result = _.cloneDeep(users[chrisId]);
        result.services = detailledServices(result);
        updateBadges(chrisId);
        return [200, fixtures.chris(result)];
      });


      // Users info
      httpBackend.whenGET(fixtures.url.users).respond(function(m, url) {
        var match = fixtures.url.users.exec(url),
          id = match ? match[1] : null,
          result;

        if (!id || !users[id]) {
          return [404, fixtures.notFound];
        } else {
          result = _.cloneDeep(users[id]);
          updateBadges(id);
          return [200, result];
        }
      });

      // school list
      httpBackend.whenGET(fixtures.url.schools).respond(fixtures.schoolList);

      // summary
      httpBackend.whenGET(fixtures.url.summary).respond(fixtures.summary);

      // Code combat username validation
      httpBackend.whenGET(fixtures.url.codeCombatCheck).respond(function(m, url) {
        var match = fixtures.url.codeCombatCheck.exec(url),
          username = match ? match[1] : null;

        if (!username) {
          return [404, fixtures.notFound];
        }

        console.log('Mocking calls to code school...');
        if (username === 'dinoboff') {
          return [200, {
            userId: '12345'
          }];
        } else {
          console.log(
            'The only valid code school ids are: ' + ['dinoboff'].join(', ')
          );
          return [404, fixtures.notFound];
        }
      });

      // Code school id validation
      httpBackend.whenGET(fixtures.url.codeSchoolCheck).respond(function(m, url) {
        var match = fixtures.url.codeSchoolCheck.exec(url),
          id = match ? match[1] : null;

        if (!id) {
          return [404, fixtures.notFound];
        }

        console.log('Mocking calls to code school...');
        if (fixtures.profiles.codeSchool[id]) {
          return [200, {
            exist: true
          }];
        } else {
          console.log(
            'The only valid code school ids are: ' +
            _.keys(fixtures.profiles.codeSchool).join(', ')
          );
          return [404, fixtures.notFound];
        }
      });

      // Code School profile
      httpBackend.whenJSONP(fixtures.url.codeSchool).respond(function(m, url) {
        var match = fixtures.url.codeSchool.exec(url),
          id = match ? match[1] : null;

        if (!id) {
          return [404, fixtures.notFound];
        }

        console.log('Mocking calls to code school...');
        if (fixtures.profiles.codeSchool[id]) {
          return [200, fixtures.profiles.codeSchool[id]];
        } else {
          console.log(
            'The only valid code school ids are: ' +
            _.keys(fixtures.profiles.codeSchool).join(', ')
          );
          return [404, fixtures.notFound];
        }

      });

      // Treehouse profile
      httpBackend.whenGET(fixtures.url.treeHouse).respond(function(m, url) {
        var match = fixtures.url.treeHouse.exec(url),
          id = match ? match[1] : null;

        if (!id) {
          return [404, fixtures.notFound];
        }

        console.log('Mocking calls to Treehouse...');
        if (fixtures.profiles.treeHouse[id]) {
          return [200, fixtures.profiles.treeHouse[id]];
        } else {
          console.log(
            'The only valid Treehouse ids are: ' +
            _.keys(fixtures.profiles.treeHouse).join(', ')
          );
          return [404, fixtures.notFound];
        }
      });

      // Request to update badges
      httpBackend.whenPOST(fixtures.url.updateBadges).respond(function(m, url) {
        var match = fixtures.url.updateBadges.exec(url),
          id = match ? match[1] : null;

        console.log('api call deprecated');

        if (!id || !users[id]) {
          return [404, fixtures.notFound];
        }

        updateBadges(id);

        return [200, users[id].services];

      });

      // Ranks
      httpBackend.whenGET(fixtures.url.ranks).respond(function(m, url) {
        var match = fixtures.url.ranks.exec(url),
          params = match && match[1] ? parseQuery(match[1]) : {},
          filteredUsers,
          services,
          sort,
          doFilter = params && params.filterByType && params.filterByValue,
          filterProperty = {};

        switch (params.sortBy) {
        case 'treeHouse':
          sort = function(s) {
            if (s.treeHouse && s.treeHouse.badges) {
              return -s.treeHouse.badges.length;
            } else {
              return 0;
            }
          };
          break;
        case 'treeHousePoints':
          sort = function(s) {
            if (s.treeHouse && s.treeHouse.points) {
              return -s.treeHouse.points;
            } else {
              return 0;
            }
          };
          break;
        case 'codeSchool':
          sort = function(s) {
            if (s.codeSchool && s.codeSchool.badges) {
              return -s.codeSchool.badges.length;
            } else {
              return 0;
            }
          };
          break;
        case 'codeSchoolPoints':
          sort = function(s) {
            if (s.codeSchool && s.codeSchool.points) {
              return -s.codeSchool.points;
            } else {
              return 0;
            }
          };
          break;
        default:
          sort = function(s) {
            return -s.totalBadges;
          };
          break;
        }

        if (doFilter) {

          if (params.filterByType === 'schoolType') {
            filterProperty = function(user) {
              return (
                fixtures.schoolTypes[params.filterByValue] &&
                fixtures.schoolTypes[params.filterByValue].indexOf &&
                fixtures.schoolTypes[params.filterByValue].indexOf(user.school) > -1
              );
            };
          } else if (params.filterByType === 'schools') {
            filterProperty.school = params.filterByValue;
          } else if (params.filterByType === 'courses') {
            filterProperty.courses = [{id: params.filterByValue}];
          } else {
            filterProperty[params.filterByType] = params.filterByValue;
          }

          filteredUsers = _.filter(users, filterProperty);
        } else {
          filteredUsers = users;
        }

        services = _.map(filteredUsers, detailledServices);

        return [200, _.sortBy(services, sort)];
      });
      
      // Events list
      httpBackend.whenGET(fixtures.url.events).respond({
        events: events,
        cursor: ''
      });

      // New event  
      httpBackend.whenPOST(fixtures.url.events).respond(function(m, u, body) {
        var event = JSON.parse(body);
        
        events.push(event);
        event.id = events.length;
        event.createdAt = new Date().toUTCString();

        return [200, event];
      });

      // Suggestions list
      httpBackend.whenGET(fixtures.url.suggestions).respond({
        suggestions: suggestions,
        cursor: ''
      });

      // New suggestion
      httpBackend.whenPOST(fixtures.url.suggestions).respond(function(m, u, body) {
        var suggestion = JSON.parse(body);

        suggestions.push(suggestion);
        suggestion.id = suggestions.length;
        suggestion.createdAt = new Date().toUTCString();

        return [200, suggestion];
      });

      // Courses
      httpBackend.whenGET(fixtures.url.courses).respond(function(m, url) {
        var query = fixtures.url.courses.exec(url)[1] || '',
          params = parseQuery(query),
          courses;

        console.log('GET ' + url);

        if (params.opened) {
          courses = _(fixtures.courses).filter({opened: true});
        } else {
          courses = _(fixtures.courses);
        }

        var resp = {
          courses: courses.omit('pw').map().value(),
          cursor: null
        };

        return [200, resp];
      });

      httpBackend.whenPOST(fixtures.url.courses).respond(function(m, u, body){
        var course = JSON.parse(body),
          newCourse = _.pick(course, ['name', 'opened', 'pw']);

        console.log('POST ' + u + ' ' + body);

        newCourse.id = fixtures.courses.length + 1 + '';
        fixtures.courses.push(newCourse);

        return [200, newCourse];
      });

      httpBackend.whenPUT(fixtures.url.courseOpen).respond(function(m, url){
        var courseId = fixtures.url.courseOpen.exec(url)[1],
          course = _.find(fixtures.courses, {id: courseId});

        console.log('PUT ' + url);

        course.opened = true;
        return [200, {}];
      });

      httpBackend.whenPUT(fixtures.url.courseClose).respond(function(m, url){
        var courseId = fixtures.url.courseClose.exec(url)[1],
          course = _.find(fixtures.courses, {id: courseId});

        console.log('PUT ' + url);

        course.opened = false;
        return [200, {}];
      });

      httpBackend.whenPOST(fixtures.url.coursePassword).respond(function(m, url, body){
        var courseId = fixtures.url.coursePassword.exec(url)[1],
          course = _.find(fixtures.courses, {id: courseId}),
          req = JSON.parse(body);

        console.log('POST ' + url + ' ' + body);

        if (!course) {
          return [404, {error: 'course not found.'}];
        } else if (req.pw && course.pw === req.pw) {
          return [200, {success: true}];
        } else {
          return [400, {success: false, error: 'wrong password'}];
        }
        return [200, {}];
      });

      httpBackend.whenPOST(fixtures.url.courseJoin).respond(function(m, url, body){
        var courseId = fixtures.url.courseJoin.exec(url)[1],
          course = _.find(fixtures.courses, {id: courseId}),
          req = JSON.parse(body),
          user = fixtures.users[req.userId];

        console.log('POST ' + url + ' ' + body);

        if (!course) {
          return [404, {error: 'course not found.'}];
        } else if (!user) {
          return [400, {error: 'user not found.'}];
        } else if (req.pw && course.pw !== req.pw) {
          return [403, {success: false, error: 'wrong password'}];
        } else {
          if (!_.find(user.courses, {id: course.id})) {
            user.courses.push(course);
          }
          return [200, {success: true, course: _.omit(course, 'pw')}];
        }
      });

      // Everything else (like html templates) should go through
      httpBackend.whenGET(/.*/).passThrough();
      httpBackend.whenJSONP('http://codecombat.com/auth/whoami?callback=JSON_CALLBACK').passThrough();

    }
  ])

  ;

})();