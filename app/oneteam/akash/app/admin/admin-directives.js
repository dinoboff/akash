/**
 * oep.admin.directives - Directives for the admin subsection.
 *
 */
(function() {
  'use strict';

  angular.module('oep.admin.directives', ['oep.templates']).

  /**
   * Directive create a menu form a list of admin link and their title
   *
   */
  directive('oepAdminMenu', function() {
    return {
      restrict: 'E',
      templateUrl: 'admin/admin-menu.html',
      scope: {
        menuItems: '=oepItems'
      },
      controller: ['$scope', '$location', function($scope, $location) {
        $scope.isActive = function(url) {
          return $location.path() === url;
        };
      }]
    };
  })

  ;

})();