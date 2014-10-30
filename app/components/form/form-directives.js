(function() {
  'use strict';

  angular.module('oep.form.directives', []).

  /**
   * Switch class on a controller parent form-group element to reflect
   * the state of the input.
   *
   * Switch 'has-error' and 'has-success' on the parent of the controller
   * with a class "form-group".
   *
   * For radio and checkbox input, the class will be switch on the parent
   * of a parent with the class "radio".
   *
   * e.g.:
   *
   *     <form role="form">
   *       <div class="form-group">
   *         <label class="control-label" for="inputError1">Input with error</label>
   *         <input type="text" class="form-control" id="inputError1" oep-bs-valid-class="true"/>
   *       </div>
   *
   *       <div>
   *         <div class="radio">
   *           <label class="checkbox">
   *             <input type="checkbox" id="checkboxError" value="option1" oep-bs-valid-class="true"/>
   *             Option one is this and that&mdash;be sure to include why it's great
   *           </label>
   *         </div>
   *       </div>
   *     </form>
   *
   */
  directive('oepBsValidClass', [

    function oepBsValidClassFactory() {
      return {
        restrict: 'A',
        scope: false,
        require: 'ngModel',
        // arguments: scope, iElement, iAttrs, controller
        link: function oepBsValidClassPostLink(s, iElement, a, model) {
          var formControl, setPristine = model.$setPristine;

          formControl = iElement.parents('.form-group');
          if (formControl.length === 0) {
            formControl = iElement.parents('.radio').parent();
          }

          model.$setPristine = function augmentedSetPristine() {
            formControl.removeClass('has-error');
            formControl.removeClass('has-success');
            return setPristine.apply(model, arguments);
          };

          model.$viewChangeListeners.push(function oepBsValidClass(){

            if (model.$pristine) {
              formControl.removeClass('has-error');
              formControl.removeClass('has-success');
              return;
            }

            if (model.$valid) {
              formControl.removeClass('has-error');
              formControl.addClass('has-success');
            } else {
              formControl.addClass('has-error');
              formControl.removeClass('has-success');
            }
          });
        }
      };
    }
  ]).

  /**
   * Check a model value is an integer.
   *
   * Usage:
   *
   *    <form>
   *       <div class="form-group">
   *         <label class="control-label" for="int">Some integer</label>
   *         <input type="number" class="form-control" id="int" oep-integer="true"/>
   *       </div>
   *    </form>
   */
  directive('oepInteger', [

    function oepIntegerFactory() {
      return {
        restrict: 'A',
        require: 'ngModel',
        // arguments: scope, iElement, iAttrs, controller
        link: function oepIntegerPostLink(s, e, a, model) {
          model.$validators.oepInteger = function oepIntegerValidator(modelValue, viewValue) {
            if (model.$isEmpty(modelValue)) {
              return true;
            }
            return !isNaN(parseInt(viewValue, 10));
          };
        }
      };
    }
  ])

  ;

})();
