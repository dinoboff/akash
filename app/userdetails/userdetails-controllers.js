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
    '$http',
    'oepUsersApi',
    'eopReportCardApi',
    'oepCurrentUserApi',
    'user',
    'repositories',
    function OepUserCtrl($timeout, $http, oepUsersApi, eopReportCardApi, oepCurrentUserApi, user, repositories) {
      var self = this,
        retryDelay = 2000;

      this.profile = user;
      this.currentUser = null;
      
      this.repositories = repositories;

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
      /*
      this.checkBadges(user.services);
      */
      this.getRecommendations = function() {
        
        oepUsersApi.getById(self.profile.id).then(function(info) {
          self.profile.services = info.services;
      
          self.badges = [
            {'url': 'http://codecombat.com/play/level/rescue-mission', 'iconUrl': 'http://codecombat.com/file/db/level/52740644904ac0411700067c/rescue_mission_icon.png', 'id': 'rescue-mission', 'name': 'Rescue Mission'},
            {'url': 'http://codecombat.com/play/level/grab-the-mushroom', 'iconUrl': 'http://codecombat.com/file/db/level/529662dfe0df8f0000000007/grab_the_mushroom_icon.png', 'id': 'grab-the-mushroom', 'name': 'Grab the Mushroom'},
            {'url': 'http://codecombat.com/play/level/drink-me', 'iconUrl': 'http://codecombat.com/file/db/level/525dc5589a0765e496000006/drink_me_icon.png', 'id': 'drink-me', 'name': 'Drink Me'},
            {'url': 'http://www.codeschool.com/courses/javascript-road-trip-part-1', 'iconUrl': 'https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/297/level-1-on-javascript-road-trip-part-1-ff645bd94243922a90b775da5ee2647c.png', 'name': 'Level 1 on JavaScript Road Trip Part 1'},
            {'url': 'http://codecombat.com/play/level/taunt-the-guards', 'iconUrl': 'http://codecombat.com/file/db/level/5276c9bdcf83207a2801ff8f/taunt_icon.png', 'id': 'taunt-the-guards', 'name': 'Taunt the Guards'},
            {'url': 'http://codecombat.com/play/level/its-a-trap', 'iconUrl': 'http://codecombat.com/file/db/level/528aea2d7f37fc4e0700016b/its_a_trap_icon.png', 'id': 'its-a-trap', 'name': 'It\'s a Trap!'},
            {'url': 'http://codecombat.com/play/level/cowardly-taunt', 'iconUrl': 'http://codecombat.com/file/db/level/525abfd9b12777d78e000009/cowardly_taunt_icon.png', 'id': 'cowardly-taunt', 'name': 'Cowardly Taunt'},
            {'url': 'http://codecombat.com/play/level/commanding-followers', 'iconUrl': 'http://codecombat.com/file/db/level/525ef8ef06e1ab0962000003/commanding_followers_icon.png', 'id': 'commanding-followers', 'name': 'Commanding Followers'},
            {'url': 'http://codecombat.com/play/level/mobile-artillery', 'iconUrl': 'http://codecombat.com/file/db/level/525085419851b83f4b000001/mobile_artillery_icon.png', 'id': 'mobile-artillery', 'name': 'Mobile Artillery'},
            {'url': 'http://codecombat.com/play/level/dungeons-of-kithgard', 'iconUrl': 'http://codecombat.com/file/db/level/5275272c69abdcb12401216e/break_the_prison_icon.png', 'id': 'dungeons-of-kithgard', 'name': 'Dungeons of Kithgard'},
            {'url': 'http://codecombat.com/play/level/gems-in-the-deep', 'iconUrl': 'http://codecombat.com/file/db/level/529662dfe0df8f0000000007/grab_the_mushroom_icon.png', 'id': 'gems-in-the-deep', 'name': 'Gems in the Deep'},
            {'url': 'http://codecombat.com/play/level/shadow-guard', 'iconUrl': 'http://codecombat.com/file/db/level/525ef8ef06e1ab0962000003/commanding_followers_icon.png', 'id': 'shadow-guard', 'name': 'Shadow Guard', 'updatedAt': 'Fri, 17 Oct 2014 07:25:49 +0000'},
            {'url': 'http://codecombat.com/play/level/true-names', 'iconUrl': 'http://codecombat.com/file/db/level/525f150306e1ab0962000018/taunt_icon.png', 'id': 'true-names', 'name': 'True Names'},
            {'url': 'http://codecombat.com/play/level/the-raised-sword', 'iconUrl': 'http://codecombat.com/file/db/level/52740644904ac0411700067c/rescue_mission_icon.png', 'id': 'the-raised-sword', 'name': 'The Raised Sword'},
            {'url': 'http://codecombat.com/play/level/the-first-kithmaze', 'iconUrl': 'http://codecombat.com/file/db/level/525ef8ef06e1ab0962000003/commanding_followers_icon.png', 'id': 'the-first-kithmaze', 'name': 'The First Kithmaze'},
            {'url': 'http://www.codeschool.com/courses/javascript-road-trip-part-1', 'iconUrl': 'https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/298/level-2-on-javascript-road-trip-part-1-e568b2c31b1fd0da0dc94cc4d5452150.png', 'name': 'Level 2 on JavaScript Road Trip Part 1'},
            {'url': 'http://www.codeschool.com/courses/javascript-road-trip-part-1', 'iconUrl': 'https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/299/level-3-on-javascript-road-trip-part-1-ae7652ab8f363e27fea8afe06cee30e3.png', 'name': 'Level 3 on JavaScript Road Trip Part 1'},
            {'url': 'http://codecombat.com/play/level/hunter-triplets', 'iconUrl': 'http://codecombat.com/file/db/level/526711d9add4f8965f000002/hunter_triplets_icon.png', 'name': 'Hunter Triplets'},
            {'url': 'http://www.codeschool.com/courses/try-git', 'iconUrl': 'https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/121/completed-try-git-b54d1cd9fa940e4a3c1925056d38eca2.png', 'name': 'Completed Try Git'},
            {'url': 'http://www.codeschool.com/courses/try-objective-c', 'iconUrl': 'https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/247/level-1-on-try-objective-c-cb1933bf0eef7e10368445e40c96f801.png', 'name': 'Level 1 on Try Objective-C'},
            {'url': 'http://codecombat.com/play/level/the-right-route', 'iconUrl': 'http://codecombat.com/file/db/level/526fd3043c637ece50001bb2/the_herd_icon.png', 'id': 'the-right-route', 'name': 'The Right Route'},
            {'url': 'http://www.codeschool.com/courses/try-jquery', 'iconUrl': 'https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/192/level-1-on-try-jquery-195852b5089f07d0a4ec66634dbc3285.png', 'name': 'Level 1 on Try jQuery'},
            {'url': 'http://www.codeschool.com/courses/try-objective-c', 'iconUrl': 'https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/248/level-2-on-try-objective-c-eb7fc97ab60c09066184efcc9b59064a.png', 'name': 'Level 2 on Try Objective-C'},
            {'iconUrl': 'https://wac.A8B5.edgecastcdn.net/80A8B5/achievement-images/badges_html_howtomakeawebsite_stage01.png', 'id': '912', 'name': 'Beginning HTML and CSS'},
            {'url': 'http://www.codeschool.com/courses/try-jquery', 'iconUrl': 'https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/193/level-2-on-try-jquery-804e03c59fd757dbe7c3964d238e37a2.png', 'name': 'Level 2 on Try jQuery'},
            {'url': 'http://www.codeschool.com/courses/discover-drive', 'iconUrl': 'https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/367/level-1-complete-on-discover-drive-a796f7534a1d5e1b0f15789a044b1a45.png', 'name': 'Level 1 Complete on Discover Drive'},
            {'url': 'http://www.codeschool.com/courses/shaping-up-with-angular-js', 'iconUrl': 'https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/393/level-1-on-shaping-up-with-angular-js-692c3614fa425d233878a702003d2f98.png', 'name': 'Level 1 on Shaping up with Angular.js'},
            {'url': 'http://www.codeschool.com/courses/try-objective-c', 'iconUrl': 'https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/249/level-3-on-try-objective-c-eb6eb18f34044444af8be55253a496ed.png', 'name': 'Level 3 on Try Objective-C'},
            {'url': 'http://www.codeschool.com/courses/try-r', 'iconUrl': 'https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/398/level-1-on-try-r-4e63910f06a5b6b1f93433378f27c1e5.png', 'name': 'Level 1 on Try R'},
            {'url': 'http://www.codeschool.com/courses/shaping-up-with-angular-js', 'iconUrl': 'https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/394/level-2-on-shaping-up-with-angular-js-e87b03dfe5b569bc9c1a67769f8bec3a.png', 'name': 'Level 2 on Shaping up with Angular.js'},
            {'url': 'http://www.codeschool.com/courses/discover-devtools', 'iconUrl': 'https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/198/level-1-on-discover-devtools-f048aefdc0cede79cff1a4ba6dcf3498.png', 'name': 'Level 1 on Discover DevTools'},
            {'url': 'http://www.codeschool.com/courses/try-r', 'iconUrl': 'https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/171/level-2-on-try-r-1cfcc8e45a6a9e76a993fa1be5e34ffb.png', 'name': 'Level 2 on Try R'},
            {'url': 'http://www.codeschool.com/courses/try-r', 'iconUrl': 'https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/172/level-3-on-try-r-0c5645d0a3466ad9436513206e0cc5c6.png', 'name': 'Level 3 on Try R'},
            {'url': 'http://www.codeschool.com/courses/try-jquery', 'iconUrl': 'https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/194/level-3-on-try-jquery-0fd4605995b2b2aed756dcd55ba3c3c8.png', 'name': 'Level 3 on Try jQuery'},
            {'url': 'http://www.codeschool.com/courses/try-r', 'iconUrl': 'https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/173/level-4-on-try-r-6b38c8d3db1668a9289a34bbebf5e6bd.png', 'name': 'Level 4 on Try R'},
            {'url': 'http://www.codeschool.com/courses/try-r', 'iconUrl': 'https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/174/level-5-on-try-r-d17d09553b76065061a7aaf79c5648a2.png', 'name': 'Level 5 on Try R'},
            {'url': 'http://www.codeschool.com/courses/try-r', 'iconUrl': 'https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/175/level-6-on-try-r-915ee507d445363194add7029433c9c0.png', 'name': 'Level 6 on Try R'},
            {'url': 'http://www.codeschool.com/courses/try-r', 'iconUrl': 'https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/176/level-7-on-try-r-4b071e224b3d6fe9e6f47e38d731c503.png', 'name': 'Level 7 on Try R'},
            {'url': 'http://www.codeschool.com/courses/rails-for-zombies-redux', 'iconUrl': 'https://d1ffx7ull4987f.cloudfront.net/images/achievements/large_badge/134/level-1-on-rails-for-zombies-redux-2ba020b1379910903e2f8724a8199404.png', 'name': 'Level 1 on Rails for Zombies Redux'}
          ];

          self.recommendedBadges = [];
          var count = 0;
          for(var i = 0; i < self.badges.length && count < 5; i++) {
            var flag = true;
            var j;
            try {
              if(flag) {
                for(j = 0; j < self.profile.services.codeSchool.badges.length; j++) {
                  if(self.profile.services.codeSchool.badges[j].name === self.badges[i].name) {
                    flag=false;
                    break;
                  }
                }
              }
            } catch (e) {}
            try {
              if(flag) {
                for(j = 0; j < self.profile.services.treeHouse.badges.length; j++) {
                  if(self.profile.services.treeHouse.badges[j].name === self.badges[i].name) {
                    flag=false;
                    break;
                  }
                }
              }
            } catch (e) {}
            try {
              if(flag) {
                for(j = 0; j < self.profile.services.codeCombat.badges.length; j++) {
                  if(self.profile.services.codeCombat.badges[j].name === self.badges[i].name) {
                    flag=false;
                    break;
                  }
                }
              }
            } catch (e) {}
            if(flag){
              self.recommendedBadges.push(self.badges[i]);
              count++;
            }
          }
        });
      };
      
      try {
        this.getRecommendations();
      } catch (e) {
          console.log(e.message);
        }
      
      /**
       * Get Number of Pull Requests
       */
      /* jshint ignore:start */
      this.getPulls = function() {
        
        oepUsersApi.getById(self.profile.id).then(function(info) {
          self.profile.services = info.services;
        
          var a = 0,
            d = 0,
            c = 0;        

          for(var k = 0; k < self.repositories.length; k++) {
            $http({
              method: 'JSONP',
              url: 'https://api.github.com/repos/' + self.repositories[k].owner +'/'+ self.repositories[k].name + '/stats/contributors' + '?callback=JSON_CALLBACK'
            }).then(function(response) {
                // success
                for (var i = 0; i < response.data.data.length; i++){
                  var username = response.data.data[i].author.login;
                  if(username === self.profile.services.github.id) {
                    for (var j = 0; j < response.data.data[i].weeks.length; j++){
                      a += response.data.data[i].weeks[j].a;
                      d += response.data.data[i].weeks[j].d;
                      c += response.data.data[i].weeks[j].c;
                    }
                  }
                }
                self.profile.services.github.pulls = c;
                self.profile.services.github.a = a;
                self.profile.services.github.d = d;
              },
              function(response) { // optional
                // failed
                console.log(response.status);
                console.log('Github data not found.\nError: '+response);
              }
            );
          }
        });
      };
      /* jshint ignore:end */
      
      try {
        if(self.profile.services.github.id !== null){
          this.getPulls();
        }
      } catch (e) {
          console.log(e.message);
        }
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
    'repositories',
    function OepUserFormListCtrl($location, $q, $http, $scope,$filter, $window, oepCurrentUserApi, oepUsersApi, oepSettings, oepDebounce, user, availableSchools, availableCourses, repositories) {
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
      
      this.repositories = repositories;
      
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
       */
      /**
      this.getPulls = function() {
        
        var a = 0,
          d = 0,
          c = 0;
        
        //var repository = 'https://api.github.com/repos/Khan/KaTex/stats/contributors';
        
        for(var k = 0; k < this.repositories.length; k++) {
          $http({
            method: 'JSONP',
            url: 'https://api.github.com/repos/' + this.repositories[k].owner +'/'+ this.repositories[k].name + '/stats/contributors' + '?callback=JSON_CALLBACK'
          }).then(function(response) {
              // success
              for (var i = 0; i < response.data.data.length; i++){
                var username = response.data.data[i].author.login;
                if(username === self.user.info.services.github.id) {
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
        }
      };
      */
      
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
