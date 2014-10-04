/**
 * oep.events.services - Module for the events subsection services.
 *
 * Defines `oepEventsApi`.
 */
(function() {
  'use strict';

  angular.module('oep.events.services', ['oep.services']).

  /**
   * oepEventsApi - Client for the OEP events API.
   *
   */
  factory('oepEventsApi', ['oepApi',
    function(api) {
      return {

        /**
         * Fetch the most recent event (after the optional cursor).
         *
         */
        get: function(cursor) {
          var param = {};

          if (cursor) {
            param.cursor = cursor;
          }
          return api.all('events').getList(param);
        },

        /**
         * Request the OEP server to create a new event.
         *
         */
        create: function(event) {
          return api.all('events').post(event);
        }
      };
    }
  ])

  ;

})();