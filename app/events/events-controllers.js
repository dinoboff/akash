/**
 * oep.events.controllers - Module for events subsection controllers.
 *
 * Defines `OepEventFormCtrl`
 *
 */

(function() {
  'use strict';

  /**
   * OepEventFormCtrl - Controller for the events subsection.
   *
   * Populate the scope currentUser property with current user info.
   *
   */
  function OepEventFormCtrl(currentUser, eventApi) {
    this.api = eventApi;
    this.currentUser = currentUser;
    this.reset();
  }

  /**
   * Request the OEP API to save the current user event.
   *
   */
  OepEventFormCtrl.prototype.save = function(event) {
    var self = this;
    console.log("Here!")
    this.saving = true;
    this.saved = false;

    return this.api.create(event).then(function(event) {
      self.event = event;
      self.saved = true;
    })['finally'](function() {
      self.saving = false;
    });
  };

  /**
   * Reset the scope initial values (Event with default values).
   *
   */
  OepEventFormCtrl.prototype.reset = function() {
    var self = this;

    this.saving = false;
    this.saved = false;
    this.event = {};    
    this.theEvent.eventName = 'My Event';
    this.theEvent.schoolType = 'Poly';
    this.theEvent.count = 40;
    this.theEvent.criteria = 'Rescue Mission badge';
    this.theEvent.service = 'Code Combat';
    this.theEvent.reward = 'earn a letter of recommendation for university applications';
    this.theEvent.comments = 'Have fun!';

    this.currentUser.auth().then(function(data) {
      if (!data || !data.info || !data.info.email) {
        return;
      }

      console.log('called');
      self.event.from = data.info.email;
    });
  };

  angular.module('oep.events.controllers', [
    'oep.events.services',
    'oep.user.services'
  ]).

  controller('OepEventFormCtrl', [
    'oepCurrentUserApi',
    'oepEventsApi',
    OepEventFormCtrl
  ])

  ;

})();