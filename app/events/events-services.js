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
        },

        /**
         * Add participant to event
         */
        addParticipant: function(event, userId, pw) {
          var payload = {};

          if (pw) {
            payload.password = pw;
          }

          return api.one('events', event.id).one('participants', userId).customPUT(payload);
        },

        /**
         * Remove a participant from an event
         */
        removeParticipant: function(event, userId) {
          return api.one('events', event.id).one('participants', userId).remove();
        },

        getDetails: function(eventId) {
          return api.one('events', eventId).get();
        }

      };
    }
  ])

  ;

})();
