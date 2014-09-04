/* jshint camelcase: false*/
/* global describe, beforeEach, it, inject, expect */

(function() {
  'use strict';

  describe('eop.card.services', function() {

    beforeEach(module('eop.card.services'));

    describe('oepTrackTreehouseCourses', function() {
      var trackCourses;

      beforeEach(function() {
        module(function($provide) {
          $provide.value('oepTreeHouseCourses', function() {
            return [{
              name: 'How to Make a Website',
              url: 'http://teamtreehouse.com/library/how-to-make-a-website',
              lessons: [
                'Beginning HTML and CSS',
                'HTML First',
                'Creating HTML Content',
              ],
              progress: 0,
              completed: false,
            }];
          });
        });

        inject(function(oepTrackTreehouseCourses) {
          trackCourses = oepTrackTreehouseCourses;
        });
      });

      it('should return courses in progress', function() {
        var data = {
          'badges': [{
            'id': 1,
            'name': 'Beginning HTML and CSS'
          }]
        }, courses = trackCourses(data);

        expect(Object.keys(courses.inProgress).length).toBe(1);
        expect(Object.keys(courses.completed).length).toBe(0);
        expect(courses.inProgress['How to Make a Website']).toBeTruthy();
        expect(courses.inProgress['How to Make a Website'].progress).toBe(1);
        expect(courses.inProgress['How to Make a Website'].completed).toBe(false);
      });

      it('should return completed courses', function() {
        var data = {
          'badges': [{
            'id': 1,
            'name': 'Beginning HTML and CSS'
          }, {
            'id': 2,
            'name': 'HTML First'
          }, {
            'id': 3,
            'name': 'Creating HTML Content'
          }]
        }, courses = trackCourses(data);

        expect(Object.keys(courses.inProgress).length).toBe(0);
        expect(Object.keys(courses.completed).length).toBe(1);
        expect(courses.completed['How to Make a Website']).toBeTruthy();
        expect(courses.completed['How to Make a Website'].progress).toBe(3);
        expect(courses.completed['How to Make a Website'].completed).toBe(true);
      });
    });

    describe('eopReportCardApi', function() {
      var api, httpBackend;

      beforeEach(inject(function(_$httpBackend_, eopReportCardApi) {
        httpBackend = _$httpBackend_;
        api = eopReportCardApi;
      }));

      describe('treeHouse', function() {
        var treeHouseData, codeSchoolData;

        beforeEach(function() {
          treeHouseData = {
            'name': 'Chris Boesch',
            'profile_name': 'chrisboesch',
            'profile_url': 'http://teamtreehouse.com/chrisboesch',
            'gravatar_url': 'https://secure.gravatar.com/avatar/6e64bb2cab5367fd6e201df2aa722512?s=200&d=https://teamtreehouse.com/assets/content/default_avatar.png&r=pg',
            'gravatar_hash': '6e64bb2cab5367fd6e201df2aa722512',
            'badges': [{
              'id': 49,
              'name': 'Newbie',
              'url': 'http://teamtreehouse.com/chrisboesch',
              'icon_url': 'https://example.com/newbie.png',
              'earned_date': '2014-04-16T02:53:54Z',
              'courses': []
            }, {
              'id': 912,
              'name': 'Beginning HTML and CSS',
              'url': 'http://teamtreehouse.com/library/how-to-make-a-website/beginning-html-and-css',
              'icon_url': 'http://example.com/img3',
              'earned_date': '2014-04-17T10:49:47Z',
              'courses': [{
                'title': 'Websites',
                'url': 'http://teamtreehouse.com/library/websites',
                'badge_count': 1
              }, {
                'title': 'How to Make a Website',
                'url': 'http://teamtreehouse.com/library/how-to-make-a-website',
                'badge_count': 1
              }, {
                'title': 'Beginning HTML and CSS',
                'url': 'http://teamtreehouse.com/library/how-to-make-a-website/beginning-html-and-css',
                'badge_count': 1
              }]
            }],
            'points': {
              'total': 48,
              'HTML': 6,
              'CSS': 6,
              'Design': 0,
              'JavaScript': 0,
              'Ruby': 6,
              'PHP': 0,
              'WordPress': 0,
              'iOS': 0,
              'Android': 0,
              'Development Tools': 0,
              'Business': 0
            }
          };

          codeSchoolData = {
            'user': {
              'username': 'bob',
              'member_since': '2014-01-01T01:00:00Z',
              'total_score': 1234,
              'avatar': 'http://gravatar.com/avatar/1234.jpg?s=80&r=pg'
            },
            'courses': {
              'completed': [{
                'title': 'JavaScript Road Trip Part 1',
                'url': 'http://www.codeschool.com/courses/javascript-road-trip-part-1',
                'badge': 'https://example.com/img1'
              }],
              'in_progress': [{
                'title': 'JavaScript Road Trip Part 2',
                'url': 'http://www.codeschool.com/courses/javascript-road-trip-part-2',
                'badge': 'http://example.com/img2'
              }]
            },
            'badges': [{
              'name': 'Level 1 on Functional HTML5 & CSS3',
              'badge': 'http://example.com/img3',
              'course_url': 'http://www.codeschool.com/courses/functional-html5-css3'
            }]
          };
        });

        it('should fetch the treehouse user data', function() {
          var result;

          httpBackend.expectGET('http://teamtreehouse.com/chris.json').respond(treeHouseData);
          api.treeHouse('chris', 5).then(function(resp) {
            result = resp;
          });
          httpBackend.flush();

          expect(result.badges).toEqual(
            [{
              id: 49,
              name: 'Newbie',
              iconUrl: 'https://example.com/newbie.png',
              earnedDate: 'April 16, 2014'
            }, {
              id: 912,
              name: 'Beginning HTML and CSS',
              iconUrl: 'http://example.com/img3',
              earnedDate: 'April 17, 2014'
            }]
          );
          expect(Object.keys(result.courses.completed).length).toEqual(0);
          expect(Object.keys(result.courses.inProgress).length).toEqual(1);
          expect(result.courses.inProgress['How to Make a Website']).toBeTruthy();
        });

        it('should fetch the code school user data', function() {
          var result;

          httpBackend.expectJSONP(
            /https:\/\/www\.codeschool\.com\/users\/bob.json\?callback=/
          ).respond(200, codeSchoolData);
          api.codeSchool('bob', 5).then(function(resp) {
            result = resp;
          });
          httpBackend.flush();

          expect(result.badges).toEqual(
            [{
              name: 'Level 1 on Functional HTML5 & CSS3',
              iconUrl: 'http://example.com/img3',
              url: 'http://www.codeschool.com/courses/functional-html5-css3'
            }]
          );
        });

        it('should check a treehouse profile exist', function() {
          var result;

          httpBackend.expectGET(
            'http://teamtreehouse.com/bob.json'
          ).respond(treeHouseData);

          api.check.treeHouse('bob').then(function(exist) {
            result = exist;
          });

          httpBackend.flush();
          expect(result).toBe(true);
        });

        it('should check a treehouse profile doesn\'t exist', function() {
          var result;

          httpBackend.expectGET(
            'http://teamtreehouse.com/bob.json'
          ).respond(404, '<html>failed</html>');

          api.check.treeHouse('bob').then(function(exist) {
            result = exist;
          });

          httpBackend.flush();
          expect(result).toBe(false);
        });

        it('should check a code school profile exist', function() {
          var result;

          httpBackend.expectGET('/api/v1/codeschool/bob').respond('{"exist": true}');

          api.check.codeSchool('bob').then(function(exist) {
            result = exist;
          });

          httpBackend.flush();
          expect(result).toBe(true);
        });

        it('should check a code school profile doesn\'t exist', function() {
          var result;

          httpBackend.expectGET('/api/v1/codeschool/bob').respond(404, '{"exist": false}');

          api.check.codeSchool('bob').then(function(exist) {
            result = exist;
          });

          httpBackend.flush();
          expect(result).toBe(false);
        });
      });

    });

  });

})();