/**
 * oep.admin.controllers - Controllers for admin subsection.
 *
 * Defines:
 *
 * - `OepAdminMetrixCtrl`
 * - `OepAdminSuggestionsCtrl`
 *
 */
(function() {
  'use strict';

  /**
   * Check the the current user is an admin and populate scope with
   * the admin menu items.
   *
   */
  function init(scope, $location, currentUserApi, menu) {
    scope.menu = menu;
    scope.loading = true;

    return currentUserApi.auth().then(function(user) {
      if (user && user.isAdmin) {
        return true;
      } else {
        $location.path('/');
        return false;
      }
    })['finally'](function() {
      scope.loading = false;
    });
  }

  /**
   * OepAdminMetrixCtrl - controller for the Metric partial.
   *
   */
  function OepAdminMetrixCtrl($location, currentUserApi, menu) {
    init(this, $location, currentUserApi, menu);
  }

  /**
   * OepAdminSuggestionsCtrl - Controller for the suggestions partials.
   *
   * Assuming the current user is an admin, it populate the controller
   * with the list of suggestions, queried from the OEP API.
   *
   */
  function OepAdminSuggestionsCtrl($location, currentUserApi, suggestionApi, $q, menu) {
    var self = this;

    this.suggestionApi = suggestionApi;

    init(this, $location, currentUserApi, menu).then(function(isAdmin) {
      if (!isAdmin) {
        return $q.reject();
      }

      return suggestionApi.get();
    }).then(function(suggestions) {
      self.suggestions = suggestions;
    });
  }

  /**
   * OepAdminSuggestionsCtrl.next - query more suggestions and add them
   * to the list of suggestions.
   *
   */
  OepAdminSuggestionsCtrl.prototype.next = function(cursor) {
    var self = this;

    this.suggestionApi.get(cursor).then(function(suggestions) {
      if (!self.suggestions) {
        self.suggestions = [];
      }

      self.suggestions = self.suggestions.concat(suggestions);
      self.suggestions.cursor = suggestions.cursor;
    });
  };

  angular.module('oep.admin.controllers', ['oep.user.services', 'oep.suggestions.services']).

  controller('OepAdminMetrixCtrl', ['$location', 'oepCurrentUserApi', 'menu', OepAdminMetrixCtrl]).
  controller('OepAdminSuggestionsCtrl', ['$location', 'oepCurrentUserApi', 'oepSuggestionsApi', '$q', 'menu', OepAdminSuggestionsCtrl])

  ;

})();