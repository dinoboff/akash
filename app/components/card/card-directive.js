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
   * Debounce validation
   *
   * TODO: Move it to debounce component.
   *
   */
  service('OepDebounceValidator', ['$window', '$q', 'oepDebounce',
    function OepServiceIdValidatorFactory($window, $q, oepDebounce) {
      var _ = $window._;

      return function OepServiceIdValidator(opts) {
        var requestCount = 0,
          delayedChecker,
          checker;

        _.defaults(opts, {
          checker: $q.when(false),
          ns: 'delayedValidation',
          successCB: angular.noop,
          errorCB: angular.noop
        });

        function delayValidation(ctrl, value) {
          // no need to validate an empty value
          if (ctrl.$isEmpty(value)) {
            ctrl.$setValidity(opts.ns, true);
            return;
          }

          ctrl.$setValidity(opts.ns + 'ValidationStarted', false);
          delayedChecker(value);
        }


        function checkModelValue(ctrl, value) {
          if (ctrl.$isEmpty(ctrl.$modelValue)) {
            ctrl.$setValidity(opts.ns, true);
            return false;
          }

          return ctrl.$modelValue === value;
        }


        function startValidation(ctrl, value) {
          if (!checkModelValue(ctrl, value)) {
            return false;
          }

          ctrl.$setValidity(opts.ns + 'ValidationStarted', true);
          ctrl.$setValidity(opts.ns + 'ValidationCompleted', false);
          requestCount++;
          return true;
        }

        function completeValidation(ctrl) {
          if (--requestCount === 0) {
            ctrl.$setValidity(opts.ns + 'ValidationCompleted', true);
          }
        }

        this.require = 'ngModel';
        this.link = function(scope, e, attr, ctrl) {
          delayedChecker = oepDebounce(function(value) {
            if (!startValidation(ctrl, value)) {
              return $q.reject('Model value has changes');
            }

            return opts.checker(value).then(function(success) {
              if (!checkModelValue(ctrl, value)) {
                return $q.reject('Model value has changes');
              }

              if (!success) {
                ctrl.$setValidity(opts.ns, false);
                return $q.reject('Model Value Invalid');
              }

              ctrl.$setValidity(opts.ns, true);
              if (attr.ngChange) {
                scope.$eval(attr.ngChange);
              }

              return {
                attr: attr,
                ctrl: ctrl,
                data: success,
                scope: scope
              };

            })['finally'](function() {
              completeValidation(ctrl);
            }).then(opts.successCB, opts.errorCB);

          }, 1000);

          checker = function(value) {
            delayValidation(ctrl, value);
            return value;
          };

          ctrl.$parsers.push(checker);
        };
      };
    }
  ]).

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
  directive('eopValidTreehouseUsername', ['OepDebounceValidator', 'eopReportCardApi',
    function eopValidTreehouseUsernameDirective(OepDebounceValidator, reportCardApi) {
      return new OepDebounceValidator({
        ns: 'eopValidTreehouseUsername',
        checker: reportCardApi.check.treeHouse,
      });
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
  directive('eopValidCodeSchoolUsername', ['OepDebounceValidator', 'eopReportCardApi',
    function eopValidCodeSchoolUsernameDirective(OepDebounceValidator, reportCardApi) {
      return new OepDebounceValidator({
        ns: 'eopValidCodeSchoolUsername',
        checker: reportCardApi.check.codeSchool,
      });
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
  directive('eopValidCodeCombatUsername', ['OepDebounceValidator', 'eopReportCardApi',
    function eopValidCodeCombatUsernameDirective(OepDebounceValidator, reportCardApi) {
      return new OepDebounceValidator({
        ns: 'eopValidCodeCombatUsername',
        checker: reportCardApi.check.codeCombat,
        successCB: function(args) {
          var idModel;

          if (
            !args.attr ||
            !args.attr.eopValidCodeCombatUsername ||
            !args.scope ||
            !args.scope.$eval
          ) {
            return;
          }

          idModel = args.scope.$eval(args.attr.eopValidCodeCombatUsername);
          if (!idModel.$setViewValue) {
            return;
          }

          idModel.$setViewValue(args.data);
        }
      });
    }
  ])

  ;

})();