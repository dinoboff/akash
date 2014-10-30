/**
 * eop.card.directives - directives for the report card components
 *
 * Defines:
 *
 * - `oepTreehouseReportCard`
 * - `oepCodeSchoolReportCard`
 * - `eopValidTreehouseUsername`
 * - `eopValidCodeSchoolUsername`
 *
 */
(function() {
  'use strict';


  angular.module(
    'eop.card.directives', [
      'eop.card.services',
      'oep.debounce.services',
      'oep.templates',
      'oep.utils.filters'
    ]
  ).

  /**
   * oepTreehouseReportCard - Directive displaying a user Treehouse badges.
   *
   */
  directive('oepTreehouseReportCard',
    function() {
      return {
        restrict: 'E',
        templateUrl: 'components/card/card-treehouse.html',
        scope: {
          info: '=oepBadges',
          isCurrentUser: '=oepIsCurrentUser'
        }
      };
    }
  ).

  /**
   * oepCodeSchoolReportCard - Directive displaying a user Code School badges.
   *
   */
  directive('oepCodeSchoolReportCard',
    function() {
      return {
        restrict: 'E',
        templateUrl: 'components/card/card-codeschool.html',
        scope: {
          info: '=oepBadges',
          isCurrentUser: '=oepIsCurrentUser'
        }
      };
    }
  ).

  /**
   * oepCodeCombatReportCard - Directive displaying a user code combat points
   *
   */
  directive('oepCodeCombatReportCard',
    function() {
      return {
        restrict: 'E',
        templateUrl: 'components/card/card-codecombat.html',
        scope: {
          info: '=oepBadges',
          isCurrentUser: '=oepIsCurrentUser'
        }
      };
    }
  ).

  /**
   * eopValidTreehouseUsername - Validator a text input (associated to a ngModel).
   *
   * Check that the the ngModel value correspond to a valid Treehouse username.
   *
   * Populate the ngModel `$error` collection with a `eopValidTreehouseUsername`
   * property set to `true` when the username doesn't exist.
   *
   */
  directive('eopValidTreehouseUsername', ['$q', 'eopReportCardApi',
    function eopValidTreehouseUsernameDirective($q, reportCardApi) {
      return {
        restrict: 'A',
        require: 'ngModel',
        scope: false,
        link: function(s, e, a, model) {
          model.$asyncValidators.eopValidTreehouseUsername = function eopValidTreehouseUsernameValidator(name) {
            return reportCardApi.check.treeHouse(name).then(function() {
              return true;
            });
          };
        }
      };
    }
  ]).

  /**
   * eopValidCodeSchoolUsername - Validator a text input (associated to a ngModel).
   *
   * Check that the the ngModel value correspond to a valid Code School username.
   *
   * Populate the ngModel `$error` collection with a `eopValidCodeSchoolUsername`
   * property set to `true` when the username doesn't exist.
   *
   */
  directive('eopValidCodeSchoolUsername', ['eopReportCardApi',
    function eopValidCodeSchoolUsernameDirective(reportCardApi) {
      return {
        restrict: 'A',
        require: 'ngModel',
        scope: false,
        link: function(s, e, a, model) {
          model.$asyncValidators.eopValidCodeSchoolUsername = function eopValidTreehouseUsernameValidator(name) {
            return reportCardApi.check.codeSchool(name).then(function() {
              return true;
            });
          };
        }
      };
    }
  ]).

  /**
   * eopValidCodeCombatUsername - Validator a text input (associated to a ngModel).
   *
   * Check that the the ngModel value correspond to a valid Code Combat username.
   *
   * Populate the ngModel `$error` collection with a `eopValidCodeCombatUsername`
   * property set to `true` when the username doesn't exist.
   *
   * It will also populate a ngModel in the form with the code combat user id.
   * e.g.:
   *
   *   <form name="myForm">
   *     <input name="userId" readonly="true" ng-model="some.scope.attribute.id"/>
   *     <input name="userName"
   *       ng-model="some.scope.attribute.name"
   *       eop-valid-code-combat-username="myForm.userId"
   *      />
   *   </form>
   *
   */
  directive('eopValidCodeCombatUsername', ['eopReportCardApi',
    function eopValidCodeCombatUsernameDirective(reportCardApi) {
      return {
        restrict: 'A',
        require: 'ngModel',
        scope: false,
        link: function(scope, e, attr, model) {
          var idModel = scope.$eval(attr.eopValidCodeCombatUsername),
            updateId;

          if (idModel && idModel.$setViewValue) {
            updateId = function(id) {
              idModel.$setViewValue(id);
              return id;
            };
          } else {
            updateId = angular.noop;
          }

          model.$asyncValidators.eopValidCodeCombatUsername = function eopValidTreehouseUsernameValidator(name) {
            return reportCardApi.check.codeCombat(name).then(updateId);
          };
        }
      };
    }
  ])

  ;

})();
