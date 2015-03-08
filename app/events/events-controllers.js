/**
 * oep.events.controllers - Module for events subsection controllers.
 *
 * Defines `OepEventFormCtrl`
 *
 */
/*global FB:false */

(function() {
  'use strict';

  var module = angular.module('oep.events.controllers', [
    'oep.date.services',
    'oep.events.services',
    'oep.user.services'
  ]);

  /**
   * OepEventFormCtrl - Controller for the events subsection.
   *
   * Populate the scope currentUser property with current user info.
   *
   */
  module.controller('OepEventFormCtrl', [
    '$timeout',
    'oepEventsApi',
    'oepDate',
    'oepIsoDate',
    'oepSettings',
    function OepEventFormCtrl($timeout, oepEventsApi, oepDate, oepIsoDate, oepSettings) {
      var today = oepDate(),
        nextYear = oepDate([today.year() + 1, 11, 31]);
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
      this.rankingOptions = oepSettings.rankingOptions;
      this.today = oepIsoDate(today);
      this.nextYear = oepIsoDate(nextYear);

      /**
       * Request the OEP API to save the current user event.
       *
       */
      this.save = function(event, editor, onsuccess, form) {
        var self = this;

        onsuccess = onsuccess || angular.noop;

        this.event.editor = editor.id;
        this.saving = true;
        this.saved = false;

        return oepEventsApi.create(event).then(function(event) {
          self.event = event;
          self.saved = true;
          self.reset(form, true);
          return event;
        })['finally'](function() {
          self.saving = false;
        }).then(onsuccess).then(function() {
          return $timeout(function() {
            self.saved = false;
          }, 5000);
        });
      };

      /**
       * Reset the scope initial values (Event with default values).
       *
       */
      this.reset = function(form, saved) {
        if (form && form.$setPristine) {
          form.$setPristine();
        }

        this.saving = false;
        this.saved = saved || false;
        this.event = {
          name: '',
          description: '',
          visibility: 'public',
          password: '',
          rankedBy: oepSettings.rankingOptions[0].id,
          cutoffNumber: null,
          cutoffDate: null,
          startDate: null
        };
      };

      this.reset();
    }
  ]);



  /**
   * OepEventsCtrl and its resolver.
   *
   */
  module.factory('oepEventsCtrlInitialData', [
    '$q',
    'oepEventsApi',
    'oepCurrentUserApi',
    function oepEventsCtrlInitialDataFactory($q, oepEventsApi, oepCurrentUserApi) {
      return function oepEventsCtrlInitialData() {
        return $q.all({
          events: oepEventsApi.get(),
          currentUser: oepCurrentUserApi.auth()
        });
      };
    }
  ]).

  /**
   * OepEventsCtrl - Controller for the events partials.
   *
   * It populates the controller with the list of events,
   * queried from the OEP API.
   *
   */
  controller('OepEventsCtrl', [
    '$q',
    'oepEventsApi',
    'initialData',
    function OepEventsCtrl($q, oepEventsApi, initialData) {
      var self = this;

      this.loading = true;
      this.events = initialData.events;
      this.currentUser = initialData.currentUser;

      this.reload = function() {
        oepEventsApi.get().then(function(events) {
          self.events = events;
        });
      };

      this.getMore = function() {
        if (!this.events.cursor) {
          return $q.reject(new Error('No cursor.'));
        }

        self.loading = $q.when(self.loading).then(function() {
          return oepEventsApi.get({cursor: self.events.cursor}).then(function(events) {
            self.events = self.events.concat(events);
            self.events.cursor = events.cursor;
          });
        });
      };
    }
  ]);

  /**
   * `OepEventDetailsCtrl` and its resolver.
   *
   */
  module.factory('oepEventDetailsCtrlInitialData', [
    '$route',
    '$q',
    'oepEventsApi',
    'oepCurrentUserApi',
    'oepUsersApi',
    function oepEventDetailsCtrlInitialDataFactory(
      $route, $q, oepEventsApi, oepCurrentUserApi, oepUsersApi
    ) {
      return function oepEventDetailsCtrlInitialData() {
        return $q.all({
          event: oepEventsApi.getDetails($route.current.params.eventId),
          currentUser: oepCurrentUserApi.auth(),
          schools: oepUsersApi.availableSchools().then(function(arrList) {
            return arrList.reduce(function(schools, item) {
              schools[item.id] = item;
              return schools;
            });
          })
        });
      };
    }
  ]).

  /**
   * OepEventDetailsCtrl
   *
   */
  controller('OepEventDetailsCtrl', [
    '$q',
    '$window',
    'oepSettings',
    'oepEventsApi',
    'initialData',
    function OepEventDetailsCtrl($q, $window, oepSettings, oepEventsApi, initialData) {
      var self = this,
        _ = $window._;
      console.log('here');
      this.share = function(eventID){
          console.log(eventID);
          FB.ui({
            method: 'feed',
            link : 'http://www.chrisboesch.com/#/events/',
            caption : 'Please Sign up for My Event - '+event.name+' by signing up on chrisvoesch.com',
            description : event.description,
          }, function(){});
        };
      this.loading = false;
      this.event = initialData.event;
      this.currentUser = initialData.currentUser;
      this.schools = initialData.schools;
      this.rankedBy = _.find(oepSettings.rankingOptions, {
        id: this.event.rankedBy
      });

      this.getMore = function() {
        if (!this.event.cursor) {
          return $q.reject(new Error('No cursor.'));
        }

        self.loading = $q.when(self.loading).then(function() {
          return oepEventsApi.getDetails(self.event.id, self.event.cursor).then(function(event) {
            self.event.stats = self.event.stats.concat(event.stats);
            self.event.cursor = event.cursor;
          });
        });
      };
    }
  ])

  ;

})();
