(function() {
  'use strict';

  angular.module('oep.research.controllers', []).

  /**
   * Use to resolve `initialData` of `OepResearchCtrl`.
   *
   * Currently empty.
   *
   */
  factory('oepResearchCtrlInitialData', [
    '$q',
    function oepResearchCtrlInitialDataFactory($q) {
      return function oepResearchCtrlInitialData() {

        return $q.all({});
      };
    }
  ]).

  /**
   * OepResearchCtrl
   *
   */
  controller('OepResearchCtrl', [
    'initialData',
    function OepResearchCtrl() {}
  ])

  ;

})();
