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
      choices: [{
        'id': 'Code School',
        'name': 'Code School'
      }, {
        'id': 'Treehouse',
        'name': 'Treehouse'
      }, {
        'id': 'Code Combat',
        'name': 'Code Combat'
      }]
    };
    this.criteria = {
      id: 'criteria',
      name: 'Criteria',
      choices: [{
        'id': '1',
        'name': 'Earn 2 badges'
      }, {
        'id': '2',
        'name': 'Earn 5 badges'
      }, {
        'id': '3',
        'name': 'Earn maximum badges'
      }]
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
    this.saving = false;
    this.saved = false;
    this.event = {};
    this.event.eventName = 'My Event';
    this.event.visibility = 'public';
    this.event.password = '';
    this.event.criteria = 1;
    this.event.services = {'Code School': false, 'Treehouse': false, 'Code Combat': false};
    this.event.reward = 'Learn coding!';
    this.event.comments = 'Have fun!';
    this.event.users = [];
    this.event.from = this.currentUser.data.info.id;
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