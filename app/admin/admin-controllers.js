/**
 * oep.admin.controllers - Controllers for admin subsection.
 *
 * Defines:
 *
 * - `OepAdminMetrixCtrl`
 * - `OepAdminSuggestionsCtrl`
 *
 */
(function() {
  'use strict';

  var module = angular.module(
    'oep.admin.controllers', ['oep.user.services', 'oep.suggestions.services']
  );


  /**
   * OepAdminMetrixCtrl - controller for the Metric partial.
   * TODO: show metric charts
   */
  function OepAdminMetrixCtrl(menu) {
    this.menu = menu;
  }

  module.controller('OepAdminMetrixCtrl', ['menu', OepAdminMetrixCtrl]);



  /**
   * OepAdminEventsCtrl - Controller for the events partials.
   *
   * Assuming the current user is an admin, it populate the controller
   * with the list of events, queried from the OEP API.
   *
   */
  function OepAdminEventsCtrl(oepEventsApi, menu, events) {
    var self = this;

    // oepEventsApi.get()
    this.events = events;
    this.menu = menu;

    /**
     * OepAdminEventsCtrl.next - query more events and add them
     * to the list of events.
     *
     */
    this.next = function(cursor) {
      oepEventsApi.get(cursor).then(function(events) {
        if (!self.events) {
          self.events = [];
        }

        self.events = self.events.concat(events);
        self.events.cursor = events.cursor;
      });
    };
  }

  module.controller('OepAdminEventsCtrl', [
    'oepEventsApi', 'menu', 'events', OepAdminEventsCtrl
  ]);
  
  
  
  /**
   * OepAdminSuggestionsCtrl - Controller for the suggestions partials.
   *
   * Assuming the current user is an admin, it populate the controller
   * with the list of suggestions, queried from the OEP API.
   *
   */
  function OepAdminSuggestionsCtrl(oepSuggestionsApi, menu, suggestions) {
    var self = this;

    // oepSuggestionsApi.get()
    this.suggestions = suggestions;
    this.menu = menu;

    /**
     * OepAdminSuggestionsCtrl.next - query more suggestions and add them
     * to the list of suggestions.
     *
     */
    this.next = function(cursor) {
      oepSuggestionsApi.get(cursor).then(function(suggestions) {
        if (!self.suggestions) {
          self.suggestions = [];
        }

        self.suggestions = self.suggestions.concat(suggestions);
        self.suggestions.cursor = suggestions.cursor;
      });
    };
  }

  module.controller('OepAdminSuggestionsCtrl', [
    'oepSuggestionsApi', 'menu', 'suggestions', OepAdminSuggestionsCtrl
  ]);



  /**
   * OepAdminCoursesCtrl - Controller for creating and updating courses
   *
   */
  function OepAdminCoursesCtrl(oepUsersApi, menu, courses) {
    var self = this;

    this.menu = menu;
    this.courses = courses;

    this.open = function(course) {
      oepUsersApi.courses.open(course).then(function() {
        course.opened = true;
      });
    };

    this.close = function(course) {
      oepUsersApi.courses.close(course).then(function() {
        course.opened = false;
      });
    };

    this.add = function(course) {
      oepUsersApi.courses.add(course).then(function(newCourse) {
        self.courses.push(newCourse);
        course.name = course.pw = course.opened = null;
      });
    };
  }

  module.controller('OepAdminCoursesCtrl', [
    'oepUsersApi', 'menu', 'courses', OepAdminCoursesCtrl
  ]);

})();