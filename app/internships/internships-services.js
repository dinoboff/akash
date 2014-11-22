/**
 * oep.internships.services - Module for the events subsection services.
 *
 * Defines `oepInternshipsApi`.
 */
(function() {
  'use strict';

  angular.module('oep.internships.services', ['oep.services']).

  /**
   * oepInternshipsApi - Client for the OEP events API.
   *
   */
  factory('oepInternshipsApi', ['oepApi',
    function(api) {
      return {

        /**
         * Fetch the most recent internships (after the optional cursor).
         *
         */
        get: function(cursor) {
          var param = {};

          if (cursor) {
            param.cursor = cursor;
          }
          return api.all('internships').getList(param);
        },

        /**
         * Request the OEP server to create a new internships.
         *
         */
        create: function(internship) {
          return api.all('internships').post(internship);
        }
      };
    }
  ])

  ;

})();
