/**
 * oep.events.controllers - Module for events subsection controllers.
 *
 * Defines `OepEventFormCtrl`
 *
 */

(function() {
  'use strict';

  var module = angular.module('oep.events.controllers', [
    'oep.events.services',
    'oep.user.services'
  ]);

  function _pad(number) {
    var r = number + '';

    if (r.length === 1) {
      r = '0' + r;
    }

    return r;
  }

  /**
   * Return an ISO date
   */
  function isoDate(date) {
    date = date || new Date();

    return date.getUTCFullYear() +
      '-' + _pad(date.getUTCMonth() + 1) +
      '-' + _pad(date.getUTCDate());
  }

  /**
   * OepEventFormCtrl - Controller for the events subsection.
   *
   * Populate the scope currentUser property with current user info.
   *
   */
  module.controller('OepEventFormCtrl', [
    'oepCurrentUserApi',
    'oepEventsApi',
    'availableSchools',
    function OepEventFormCtrl(currentUser, eventApi, availableSchools) {

      var today = new Date(),
        nextYear = new Date(today.getFullYear() + 1, 11, 31);
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
      this.today = isoDate(today);
      this.nextYear = isoDate(nextYear);

      /**
       * Request the OEP API to save the current user event.
       *
       */
      this.save = function(event) {
        var self = this;

        if (!this.event.services['Code School'] && !this.event.services.Treehouse && !this.event.services['Code Combat']) {
          this.event.services['Code School'] = true;
          this.event.services.Treehouse = true;
          this.event.services['Code Combat'] = true;
        }

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
      this.reset = function() {
        this.saving = false;
        this.saved = false;
        this.event = {};
        this.event.name = 'My Event';
        this.event.visibility = 'public';
        this.event.password = '';
        this.event.criteria = 1;
        this.event.services = {
          'Code School': true,
          'Treehouse': false,
          'Code Combat': false
        };
        this.event.startDate = this.today;
        this.event.endDate = this.today;
        this.event.reward = 'Learn coding!';
        this.event.description = 'Have fun!';
        this.event.participants = [];
        this.event.editor = this.currentUser.data.info.id;
      };

      this.reset();
    }
  ]);

  /**
   * OepEventsCtrl - Controller for the events partials.
   *
   * It populates the controller with the list of events,
   * queried from the OEP API.
   *
   */
  module.controller('OepEventsCtrl', [
    'oepCurrentUserApi',
    'oepEventsApi',
    'events',
    function OepEventsCtrl(currentUser, oepEventsApi, events) {
      this.currentUser = currentUser;
      this.api = oepEventsApi;

      // oepEventsApi.get()
      this.events = events;

      this.add = function(event) {
        var self = this;

        this.saving = true;
        this.saved = false;

        return this.api.addParticipant(event, this.currentUser.data.info.id).then(function() {
          event.participants.push(self.currentUser.data.info.id);
          self.saved = true;
        })['finally'](function() {
          self.saving = false;
        });
      };

      this.remove = function(event) {
        var self = this;

        this.saving = true;
        this.saved = false;

        return this.api.removeParticipant(event, this.currentUser.data.info.id).then(function() {
          self.saved = true;

          for (var i = 0; i < event.participants.length; i++) {
            if (event.participants[i] === self.currentUser.data.info.id) {
              event.participants.splice(i, 1);
              i--;
            }
          }

        })['finally'](function() {
          self.saving = false;
        });

      };
    }
    /**
    function formatDate(dateString) {
      var day = dateString.substring(8),
          month = dateString.substring(5,7),
          year = dateString.substring(0,4);

      return day+' '+month+' '+year;
    }
    */
  ]);

})();
