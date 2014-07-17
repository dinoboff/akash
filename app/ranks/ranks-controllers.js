/**
 * oep.ranks.controllers - Controller for the ranks subsection
 *
 * Defines `OepRanksShowRanks`.
 */
(function() {
  'use strict';

  var module = angular.module(
    'oep.ranks.controllers', [
      'oep.config',
      'oep.user.services',
      'eop.card.directives'
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
  module.controller('OepRanksShowRanks', [
    'oepUsersApi',
    'oepCurrentUserApi',
    'oepSettings',
    '$window',
    function OepRanksShowRanks(userApi, currentUserApi, settings, window) {
      var self = this,
        $ = window.jQuery;

      this.currentUser = currentUserApi;
      this.userApi = userApi;

      this.filterOptions = $.extend({}, settings.userOptions);
      this.filterOptions.schools = {
        id: 'schools',
        name: 'Schools',
        choices: []
      };

      this.filterBy = {};
      this.ranks = null;
      this.userStats = null;
      this.sortBy = 'totalBadges';

      /** Methods **/

      /**
       * Populate the scope `userStats` property with the current user stats
       * if he's not part of the top rank.
       */
      this.setUserStats = function() {
        if (this.ranks === null) {
          return;
        }

        if (!this.currentUser.data || !this.currentUser.data.stats) {
          return;
        }

        for (var i = 0; i < this.ranks.length; i++) {
          if (this.ranks[i].id === this.currentUser.data.stats.id) {
            return;
          }
        }

        this.userStats = this.currentUser.data.stats;
      };

      /**
       * Fetch rank and populate the scope `ranks` property with it.
       *
       */
      this.getRanks = function() {
        var opts = {};

        if (
          this.filterBy &&
          this.filterBy.type &&
          this.filterBy.type.id &&
          this.filterBy.value &&
          this.filterBy.value.id
        ) {
          opts.filterByType = this.filterBy.type.id;
          opts.filterByValue = this.filterBy.value.id;
        }

        if (this.sortBy) {
          opts.sortBy = this.sortBy;
        }

        this.ranks = null;
        return this.userApi.getRanks(opts).then(function(ranks) {
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
        this.sortBy = sortBy;
        return this.getRanks();
      };

      /**
       * Reset rank and filter value when the filter type changes.
       *
       */
      this.filterTypeChanged = function() {
        if (this.filterBy.value) {
          this.filterBy.value = null;
          this.getRanks();
        }
      };

      /** init. ranks **/

      currentUserApi.auth().then(this.setUserStats.bind(this));
      userApi.availableSchools().then(function(schools) {
        self.filterOptions.schools.choices = schools;
      });
      this.getRanks();
    }
  ]);

})();