/**
 * oep.eventsView.controllers - Module for events subsection controllers.
 *
 * Defines `OepEventsCtrl`
 *
 */

(function() {
  'use strict';
  
  /**
   * OepEventsCtrl - Controller for the events partials.
   *
   * It populates the controller with the list of events,
   * queried from the OEP API.
   *
   */
  function OepEventsCtrl(oepEventsApi, events) {

    // oepEventsApi.get()
    this.events = events;
  }

  angular.module('oep.eventsView.controllers', [
    'oep.events.services',
    'oep.user.services'
  ]).
  
  controller('OepEventsCtrl', [
    'oepEventsApi', 'events', OepEventsCtrl
  ]);

})();