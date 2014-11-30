/**
 * oep module - root module
 *
 * Define the angular app and its partials routes.
 *
 */
/*global FB:false */

(function() {
  'use strict';

  var adminMenu = {
    metrics: {
      url: '/admin/metrics',
      title: 'Metrics'
    },

    events: {
      url: '/admin/events',
      title: 'Events'
    },
    suggestions: {
      url: '/admin/suggestions',
      title: 'Suggestions'
    },
    courses: {
      url: '/admin/courses',
      title: 'Courses'
    },
    internships: {
      url: '/admin/internships',
      title: 'Internships'
    },
    github: {
      url: '/admin/github',
      title: 'Github'
    }

  };

  angular.module(
    'oep', [
      'angular-loading-bar',
      'ngRoute',
      'oep.admin.controllers',
      'oep.admin.directives',
      'oep.controllers',
      'oep.date.filters',
      'oep.events.controllers',
      'oep.events.directives',
      'oep.form.directives',
      'oep.internships.controllers',
      'oep.navbar.controllers',
      'oep.ranks.controllers',
      'oep.research.controllers',
      'oep.scholarships.controllers',
      'oep.scholarships.directive',
      'oep.suggestions.controllers',
      'oep.templates',
      'oep.user.directives',
      'oep.user.services',
      'oep.userdetails.controllers'
    ]
  ).run(['$window', function initFb($window) {
      $window.fbAsyncInit = function() {
        FB.init({
          appId      : '385785628251668',
          xfbml      : true,
          version    : 'v2.2'
        });
      };
      (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s);
        js.id = id;
        js.src = '//connect.facebook.net/en_US/sdk.js';
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    }]).
  config(['$routeProvider', 'cfpLoadingBarProvider',
    function($routeProvider, cfpLoadingBarProvider) {
      var adminMenuResolver = ['$location', 'oepCurrentUserApi',
          function($location, oepCurrentUserApi) {
            // Resolve the the menu object
            // And check user permission.
            return oepCurrentUserApi.auth().then(function(user) {
              if (user && user.isAdmin) {
                return adminMenu;
              } else {
                $location.path('/');
                return;
              }
            }).catch(function() {
              $location.path('/');
            });
          }
        ];

      $routeProvider.
      when('/admin', {
        redirectTo: adminMenu.metrics.url
      }).
      when(adminMenu.metrics.url, {
        templateUrl: 'admin/admin-metrics.html',
        controller: 'OepAdminMetrixCtrl',
        controllerAs: 'ctrl',
        resolve: {
          menu: adminMenuResolver
        }
      }).
      when(adminMenu.events.url, {
        templateUrl: 'admin/admin-events.html',
        controller: 'OepAdminEventsCtrl',
        controllerAs: 'ctrl',
        resolve: {
          menu: adminMenuResolver,
          events: ['oepEventsApi',
            function(oepEventsApi) {
              return oepEventsApi.get();
            }
          ]
        }
      }).
      when(adminMenu.internships.url, {
        templateUrl: 'admin/admin-internships.html',
        controller: 'OepAdminInternshipsCtrl',
        controllerAs: 'ctrl',
        resolve: {
          menu: adminMenuResolver,
          internships: ['oepInternshipsApi',
            function(oepInternshipsApi) {
              return oepInternshipsApi.get();
            }
          ]
        }
      }).
      when(adminMenu.suggestions.url, {
        templateUrl: 'admin/admin-suggestions.html',
        controller: 'OepAdminSuggestionsCtrl',
        controllerAs: 'ctrl',
        resolve: {
          menu: adminMenuResolver,
          suggestions: ['oepSuggestionsApi',
            function(oepSuggestionsApi) {
              return oepSuggestionsApi.get();
            }
          ]
        }
      }).
      when(adminMenu.courses.url, {
        templateUrl: 'admin/admin-courses.html',
        controller: 'OepAdminCoursesCtrl',
        controllerAs: 'ctrl',
        resolve: {
          menu: adminMenuResolver,
          courses: ['oepUsersApi',
            function(oepUsersApi) {
              return oepUsersApi.courses.all();
            }
          ]
        }
      }).
      when(adminMenu.github.url, {
        templateUrl: 'admin/admin-github.html',
        controller: 'OepAdminGithubCtrl',
        controllerAs: 'ctrl',
        resolve: {
          menu: adminMenuResolver,
          repositories: ['oepUsersApi',
            function(oepUsersApi) {
              return oepUsersApi.repositories.all();
            }
          ]
        }
      }).

      when('/events', {
        templateUrl: 'events/events-view-list.html',
        controller: 'OepEventsCtrl',
        controllerAs: 'ctrl',
        resolve: {
          initialData: ['oepEventsCtrlInitialData',
            function(oepEventsCtrlInitialData) {
              return oepEventsCtrlInitialData();
            }
          ]
        }
      }).
      when('/events/:eventId', {
        templateUrl: 'events/events-view-details.html',
        controller: 'OepEventDetailsCtrl',
        controllerAs: 'ctrl',
        resolve: {
          initialData: [
            'oepEventDetailsCtrlInitialData',
            function(oepEventDetailsCtrlInitialData) {
              return oepEventDetailsCtrlInitialData();
            }
          ]
        }
      }).

      when('/suggestion', {
        templateUrl: 'suggestions/sugestions-form.html',
        controller: 'OepSuggestionFormCtrl',
        controllerAs: 'ctrl',
      }).
      when('/internship', {
        templateUrl: 'internships/internships.html',
        controller: 'OepInternshipsCtrl',
        controllerAs: 'ctrl',
        resolve: {
          'currentUser': [
            '$location',
            'oepCurrentUserApi',
            function($location, oepCurrentUserApi) {
              return oepCurrentUserApi.auth().then(function(user) {
                if (!user.info) {
                  $location.path('/edit');
                }
                return user;
              });
            }
          ]
        }
      }).
      when('/a', {
        templateUrl: 'oneteam/a.html',
        controller: 'SummaryController',
        controllerAs: 'ctrl',
      }).
      when('/b', {
        templateUrl: 'oneteam/b.html',
        controller: 'OepRanksShowRanksCtrl',
        controllerAs: 'ctrl',
      }).
      when('/c', {
        templateUrl: 'oneteam/c.html',
        controller: 'OepRanksShowRanksCtrl',
        controllerAs: 'ctrl',
      }).
      when('/d', {
        templateUrl: 'oneteam/d.html',
        controller: 'OepRanksShowRanksCtrl',
        controllerAs: 'ctrl',
      }).
      when('/ranks', {
        templateUrl: 'ranks/ranks.html',
        controller: 'OepRanksShowRanksCtrl',
        controllerAs: 'ctrl',
        resolve: {
          initialData: [
            'oepRanksShowRanksCtrlInitialData',
            function(oepRanksShowRanksCtrlInitialData) {
              return oepRanksShowRanksCtrlInitialData();
            }
          ]
        }
      }).
      when('/ranks/:sortBy/:filterByType/:filterByValue', {
        templateUrl: 'ranks/ranks.html',
        controller: 'OepRanksShowRanksCtrl',
        controllerAs: 'ctrl',
        resolve: {
          initialData: [
            'oepRanksShowRanksCtrlInitialData',
            function(oepRanksShowRanksCtrlInitialData) {
              return oepRanksShowRanksCtrlInitialData();
            }
          ]
        }
      }).
      when('/user/:userId', {
        templateUrl: 'userdetails/userdetails-user.html',
        controller: 'OepUserCtrl',
        controllerAs: 'ctrl',
        resolve: {
          user: ['$route', 'oepUsersApi', 'oepCurrentUserApi',
            function($route, usersApi, currentUserApi) {
              var pAuth = currentUserApi.auth();

              return usersApi.getById(
                $route.current.params.userId
              ).then(function(userInfo) {
                return pAuth.then(function(currentUser) {
                  userInfo.isCurrentUser = (
                    currentUser.info &&
                    currentUser.info.id === userInfo.id
                  );
                  return userInfo;
                });
              });
            }
          ],
          repositories: ['oepUsersApi',
            function(oepUsersApi) {
              return oepUsersApi.repositories.all();
            }
          ]
        }
      }).
      when('/edit', {
        templateUrl: 'userdetails/userdetails-edit.html',
        controller: 'OepUserFormListCtrl',
        controllerAs: 'ctrl',
        resolve: {
          user: ['oepCurrentUserApi', '$location',
            function(currentUserApi, $location) {
              return currentUserApi.auth().then(function(user) {
                if (!user.isLoggedIn) {
                  $location.path('/ranks');
                }
                return user;
              });
            }
          ],
          availableSchools: ['oepUsersApi',
            function(oepUsersApi) {
              return oepUsersApi.availableSchools();
            }
          ],
          availableCourses: ['oepUsersApi',
            function(oepUsersApi) {
              return oepUsersApi.courses.all(true);
            }
          ],
          repositories: ['oepUsersApi',
            function(oepUsersApi) {
              return oepUsersApi.repositories.all();
            }
          ]
        }
      }).
      when('/research', {
        templateUrl: 'research/research-view.html',
        controller: 'OepResearchCtrl',
        controllerAs: 'ctrl',
        resolve: {
          initialData: [
            'oepResearchCtrlInitialData',
            function(oepResearchCtrlInitialData) {
              return oepResearchCtrlInitialData();
            }
          ]
        }
      }).
      when('/research/internships', {
        templateUrl: 'research/research-internships.html',
        controller: 'OepUserFormListCtrl',
        controllerAs: 'ctrl',
        resolve: {
          user: ['oepCurrentUserApi', '$location',
            function(currentUserApi, $location) {
              return currentUserApi.auth().then(function(user) {
                if (!user.isLoggedIn) {
                  $location.path('/ranks');
                }
                return user;
              });
            }
          ],
          availableSchools: ['oepUsersApi',
            function(oepUsersApi) {
              return oepUsersApi.availableSchools();
            }
          ],
          availableCourses: ['oepUsersApi',
            function(oepUsersApi) {
              return oepUsersApi.courses.all(true);
            }
          ],
          repositories: ['oepUsersApi',
            function(oepUsersApi) {
              return oepUsersApi.repositories.all();
            }
          ]
        }
      }).
      when('/research/github', {
        templateUrl: 'research/research-github.html',
        controller: 'OepUserCtrl',
        controllerAs: 'ctrl',
        resolve: {
          user: ['$window', '$location', 'oepCurrentUserApi',
            function($window, $location, userApi) {
              return userApi.auth().then(function(data) {
                if (data && data.loginUrl) {
                  $location.path('/ranks');
                  return;
                }

                if (!data.info) {
                  $location.path('/edit');
                } else {
                  return $window.jQuery.extend({
                      isCurrentUser: true
                    },
                    data.info
                  );
                }
              });
            }
          ],
          repositories: ['oepUsersApi',
            function(oepUsersApi) {
              return oepUsersApi.repositories.all();
            }
          ]
        }
      }).
      when('/research/newsfeed', {
        templateUrl: 'research/research-newsfeed.html',
        controller: 'OepResearchCtrl',
        controllerAs: 'ctrl',
        resolve: {
          initialData: [
            'oepResearchCtrlInitialData',
            function(oepResearchCtrlInitialData) {
              return oepResearchCtrlInitialData();
            }
          ]
        }
      }).
      when('/research/luckydraw', {
        templateUrl: 'research/research-luckydraw.html',
        controller: 'OepResearchCtrl',
        controllerAs: 'ctrl',
        resolve: {
          initialData: [
            'oepResearchCtrlInitialData',
            function(oepResearchCtrlInitialData) {
              return oepResearchCtrlInitialData();
            }
          ]
        }
      }).
      when('/research/activitylog', {
        templateUrl: 'research/research-activitylog.html',
        controller: 'OepResearchCtrl',
        controllerAs: 'ctrl',
        resolve: {
          initialData: [
            'oepResearchCtrlInitialData',
            function(oepResearchCtrlInitialData) {
              return oepResearchCtrlInitialData();
            }
          ]
        }
      }).
      when('/research/wishlist', {
        templateUrl: 'research/research-wishlist.html',
        controller: 'OepResearchCtrl',
        controllerAs: 'ctrl',
        resolve: {
          initialData: [
            'oepResearchCtrlInitialData',
            function(oepResearchCtrlInitialData) {
              return oepResearchCtrlInitialData();
            }
          ]
        }
      }).
      when('/research/recommendation', {
        templateUrl: 'research/research-recommendation.html',
        controller: 'OepUserCtrl',
        controllerAs: 'ctrl',
        resolve: {
          user: ['$window', '$location', 'oepCurrentUserApi',
            function($window, $location, userApi) {
              return userApi.auth().then(function(data) {
                if (data && data.loginUrl) {
                  $location.path('/ranks');
                  return;
                }

                if (!data.info) {
                  $location.path('/edit');
                } else {
                  return $window.jQuery.extend({
                      isCurrentUser: true
                    },
                    data.info
                  );
                }
              });
            }
          ],
          repositories: ['oepUsersApi',
            function(oepUsersApi) {
              return oepUsersApi.repositories.all();
            }
          ]
        }
      }).
      when('/scholarships', {
        templateUrl: 'scholarships/scholarships-view-list.html',
        controller: 'OepScholarshipsListCtrl',
        controllerAs: 'ctrl',
        resolve: {
          initialData: [
            'oepScholarshipsListCtrlInitialData',
            function(oepScholarshipsListCtrlInitialData) {
              return oepScholarshipsListCtrlInitialData();
            }
          ]
        }
      }).
      when('/scholarships/:scholarshipsId', {
        templateUrl: 'scholarships/scholarships-view-details.html',
        controller: 'OepScholarshipDetailsCtrl',
        controllerAs: 'ctrl',
        resolve: {
          initialData: [
            'oepScholarshipDetailsCtrlInitialData',
            function(oepScholarshipDetailsCtrlInitialData) {
              return oepScholarshipDetailsCtrlInitialData();
            }
          ]
        }
      }).
      when('/', {
        templateUrl: 'userdetails/userdetails-user.html',
        controller: 'OepUserCtrl',
        controllerAs: 'ctrl',
        resolve: {
          user: ['$window', '$location', 'oepCurrentUserApi',
            function($window, $location, userApi) {
              return userApi.auth().then(function(data) {
                if (data && data.loginUrl) {
                  $location.path('/ranks');
                  return;
                }

                if (!data.info) {
                  $location.path('/edit');
                } else {
                  return $window.jQuery.extend({
                      isCurrentUser: true
                    },
                    data.info
                  );
                }
              });
            }
          ],
          repositories: ['oepUsersApi',
            function(oepUsersApi) {
              return oepUsersApi.repositories.all();
            }
          ]
        }
      }).
      otherwise({
        redirectTo: '/'
      });

      cfpLoadingBarProvider.includeSpinner = false;
    }
  ])

  ;

})();
