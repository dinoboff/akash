/**
 * oep.ranks.controllers - Controller for the ranks subsection
 *
 * Defines `OepRanksShowRanks`.
 */
(function() {
  'use strict';

  var module = angular.module(
    'oep.ranks.controllers', [
      'eop.card.directives', // TODO: rename
      'ngRoute',
      'oep.config',
      'oep.events.services',
      'oep.user.services'
    ]);

  module.factory('oepRanksShowRanksCtrlInitialData', [
    '$q',
    'oepCurrentUserApi',
    'oepUsersApi',
    'oepEventsApi',
    function oepRanksShowRanksCtrlInitialDataFactory($q, oepCurrentUserApi, oepUsersApi, oepEventsApi) {
      return function oepRanksShowRanksCtrlInitialData() {
        return $q.all({
          currentUser: oepCurrentUserApi.auth(),
          availableSchools: oepUsersApi.availableSchools(),
          allCourses: oepUsersApi.courses.all(),
          openedEvents: oepEventsApi.get({limit: 0, opened: true})
        });
      };
    }
  ]);

  /**
   * OepRanksShowRanks - Controller for the ranks subsction
   *
   * Fetch the users ranks to populate the scope (added the ranks
   * property.
   *
   * Scope will also include `sortBy` order and the current user stats
   * (as `userStats`) If the current user is not part of top ranks.
   *
   */
  module.controller('OepRanksShowRanksCtrl', [
    '$routeParams',
    '$window',
    '$location',
    'oepUsersApi',
    'oepSettings',
    'initialData',
    function OepRanksShowRanksCtrl($routeParams, $window, $location, oepUsersApi, oepSettings, initialData) {
      var self = this,
        $ = $window.jQuery;

      this.filterOptions = $.extend({}, oepSettings.userOptions);
      this.filterOptions.schools = {
        id: 'schools',
        name: 'Schools',
        choices: initialData.availableSchools
      };
      this.filterOptions.courses = {
        id: 'courses',
        name: 'Courses',
        choices: initialData.allCourses
      };
      this.filterOptions.events = {
        id: 'events',
        name: 'Events',
        choices: initialData.openedEvents
      };


      this.filterBy = null;
      this.rankOpts = $.extend({sortBy: 'totalBadges'}, $routeParams);
      this.ranks = null;
      this.userStats = null;


      /** Methods **/

      /**
       * Populate the scope `userStats` property with the current user stats
       * if he's not part of the top rank.
       */
      this.setUserStats = function() {
        this.userStats = null;

        if (this.ranks === null) {
          return;
        }

        if (!initialData.currentUser.info || !initialData.currentUser.info.services) {
          return;
        }

        for (var i = 0; i < this.ranks.length; i++) {
          if (this.ranks[i].id === initialData.currentUser.info.id) {
            return;
          }
        }

        this.userStats = initialData.currentUser.info.services;
      };

      /**
       * Fetch rank and populate the scope `ranks` property with it.
       *
       */
      this.getRanks = function() {
        this.ranks = null;
        return oepUsersApi.getRanks(this.rankOpts).then(function(ranks) {
          self.ranks = ranks;
          self.setUserStats();
          return ranks;
        });
      };

      /**
       * Update sortBy and update rank.
       *
       */
      this.getRanksSortedBy = function(sortBy) {
        this.rankOpts.sortBy = sortBy;
        return this.getRanks();
      };

      /**
       * Reset rank and filter value when the filter type changes.
       *
       */
      this.filterTypeChanged = function() {
        if (this.filterBy && this.filterBy.id) {
          this.rankOpts.filterByType = this.filterBy.id;
        } else {
          delete this.rankOpts.filterByType;
        }
        if (this.rankOpts.filterValue) {
          delete this.rankOpts.filterValue;
          this.getRanks();
        }
      };

      /**
       * Build link to current to current rank
       */
      this.link = function() {
        var loc = window.location,
          parts = [loc.protocol, '//', loc.host, loc.pathname, '#/ranks'];

        if (
          this.rankOpts.sortBy &&
          this.rankOpts.filterByType &&
          this.rankOpts.filterByValue
        ) {
          parts.push(
            '/', this.rankOpts.sortBy,
            '/', this.rankOpts.filterByType,
            '/', this.rankOpts.filterByValue
          );
        }

        return parts.join('');
      };

      /** init. ranks **/

      if (this.rankOpts.filterByType) {
        this.filterBy = window._.find(
          this.filterOptions, {id: this.rankOpts.filterByType}
        );
      }

      this.getRanks();
    }
  ]);

})();
