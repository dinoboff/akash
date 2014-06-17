/**
 * oep module - root module
 *
 * Define the angular app and its partials routes.
 *
 */
(function() {
  'use strict';

  var adminMenu = {
    metrics: {
      url: '/admin/metrics',
      title: 'Metrics'
    },
    suggestions: {
      url: '/admin/suggestions',
      title: 'Suggestions'
    }
  };

  angular.module(
    'oep', [
      'oep.navbar.controllers',
      'ngRoute',
      'oep.admin.controllers',
      'oep.admin.directives',
      'oep.ranks.controllers',
      'oep.suggestions.controllers',
      'oep.templates',
      'oep.user.directives',
      'oep.user.services',
      'oep.userdetails.controllers'
    ]
  ).

  config(['$routeProvider',
    function($routeProvider) {
      $routeProvider.
      when('/admin', {
        redirectTo: adminMenu.metrics.url
      }).
      when(adminMenu.metrics.url, {
        templateUrl: 'admin/admin-metrics.html',
        controller: 'OepAdminMetrixCtrl',
        controllerAs: 'ctrl',
        resolve: {
          menu: function() {
            return adminMenu;
          }
        }
      }).
      when(adminMenu.suggestions.url, {
        templateUrl: 'admin/admin-suggestions.html',
        controller: 'OepAdminSuggestionsCtrl',
        controllerAs: 'ctrl',
        resolve: {
          menu: function() {
            return adminMenu;
          }
        }
      }).
      when('/suggestion', {
        templateUrl: 'suggestions/sugestions-form.html',
        controller: 'OepSuggestionFormCtrl',
        controllerAs: 'ctrl',
      }).
      when('/ranks', {
        templateUrl: 'ranks/ranks.html',
        controller: 'OepRanksShowRanks',
        controllerAs: 'ctrl',
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
          ]
        }
      }).
      otherwise({
        redirectTo: '/'
      });
    }
  ])

  ;

})();