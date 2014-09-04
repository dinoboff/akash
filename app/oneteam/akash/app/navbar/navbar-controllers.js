/**
 * oep.navbar.controllers - COntroller for the navbar subsection.
 *
 * Defines `OepNavBarCtrl`
 */
(function() {
  'use strict';

  /**
   * OepNavBarCtrl - Controller for navbar menu
   *
   * Fetch current user info and populate scope's user property with it.
   *
   * TODO: define `isActive`.
   *
   */
  function OepNavBarCtrl(userApi) {
    this.user = userApi;
    this.user.auth();
  }

  angular.module('oep.navbar.controllers', ['oep.user.services']).

  controller('OepNavBarCtrl', ['oepCurrentUserApi', OepNavBarCtrl]);

})();