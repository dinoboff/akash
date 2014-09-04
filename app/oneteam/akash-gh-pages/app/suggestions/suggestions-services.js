/**
 * oep.suggestions.services - Module for the suggestions subsection services.
 *
 * Defines `oepSuggestionsApi`.
 */
(function() {
  'use strict';

  angular.module('oep.suggestions.services', ['oep.services']).

  /**
   * oepSuggestionsApi - Client for the OEP suggestions API.
   *
   */
  factory('oepSuggestionsApi', ['oepApi',
    function(api) {
      return {

        /**
         * Fetch the most recent suggestion (after the optional cursor).
         *
         */
        get: function(cursor) {
          var param = {};

          if (cursor) {
            param.cursor = cursor;
          }

          return api.all('suggestions').getList(param);
        },

        /**
         * Request the OEP server to create a new suggestion.
         *
         */
        create: function(suggestion) {
          return api.all('suggestions').post(suggestion);
        }
      };
    }
  ])

  ;

})();
