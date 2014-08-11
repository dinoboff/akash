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
  function OepEventFormCtrl(currentUser, eventApi, availableSchools) {
    this.api = eventApi;
    this.currentUser = currentUser;
    this.schools = {
      id: 'schools',
      name: 'Schools',
      choices: availableSchools
    };
    this.services = {
      id: 'services',
      name: 'Services',
      choices: [
        {'id': '1', 'name': 'Code School'},
        {'id': '2', 'name': 'Treehouse'},
        {'id': '3', 'name': 'Code Combat'}
      ]
    };
    this.criteria = {
      id: 'criteria',
      name: 'Criteria',
      choices: [
        {'id': '1', 'name': 'Earn 2 badges'},
        {'id': '2', 'name': 'Earn 5 badges'},
        {'id': '3', 'name': 'Earn maximum badges'}
      ]
    };
    this.reset();
  }

  /**
   * Request the OEP API to save the current user event.
   *
   */
  OepEventFormCtrl.prototype.save = function(event) {
    var self = this;
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
    this.event.eventName = 'My Event';
    this.event.school = 'Any';
    this.event.count = 40;
    this.event.criteria = 'Earn 1 badge';
    this.event.service = 'Any';
    this.event.reward = 'Earn a letter of recommendation for university applications';
    this.event.comments = 'Have fun!';

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
    'availableSchools',
    OepEventFormCtrl
  ])

  ;

})();