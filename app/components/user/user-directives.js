/**
 * oep.user.directives - Directives for the user components
 *
 * Defines oepUniqId.
 *
 */
(function() {
  'use strict';

  angular.module('oep.user.directives', ['oep.user.services']).

  /**
   * oepUniqId - Validator for input associated to a ngModel checking
   * there's no OEP user an id identical to the ngModel value.
   *
   */
  directive('oepUniqId', [
    '$q',
    'oepUsersApi',
    function($q, oepUsersApi) {
      return {
        require: 'ngModel',
        link: function(s, e, a, model) {
          model.$asyncValidators.oepUniqId = function(id) {
            return oepUsersApi.getById(id).then(
              function() {
                return $q.reject(new Error('this id is already taken'));
              },
              function(resp) {
                if (resp.status !== 404) {
                  model.$setValidity('eopValidTreehouseUsernameRequest', false);
                }
                return true;
              });
          };
        }
      };
    }
  ]).

  /**
   * It will reset the error message after an edit of model.
   *
   * TODO: move it to form component
   *
   */
  directive('oepResetErrors', [function() {
    return {
      require: 'ngModel',
      link: function(s, e, attr, ctrl) {
        var errorIds = attr.oepResetErrors.split(','),
          lastValue;

        ctrl.$parsers.unshift(function(viewValue) {
          if (lastValue === viewValue) {
            return viewValue;
          } else {
            lastValue = viewValue;
          }

          for (var i = 0; i < errorIds.length; i++) {
            ctrl.$setValidity(errorIds[i], true);
          }

          return viewValue;
        });
      }
    };
  }])

  ;

})();
