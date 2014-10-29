/**
 * oep.internships.controllers - Module for events subsection controllers.
 *
 * Defines `OepInternships`
 *
 */

(function() {
  'use strict';

  var module = angular.module('oep.internships.controllers', [
    'oep.date.services',
    'oep.user.services'
  ]);

  /**
   * OepInternships - Controller for the internships subsection.
   *
   * Populate the scope currentUser property with current user info.
   *
   */
  module.controller('OepInternshipsCtrl', [
    '$window',
    'oepCurrentUserApi',
    'oepIsoDate',
    'currentUser',
    function OepInternshipsCtrl($window, oepCurrentUserApi, oepIsoDate, currentUser) {
      var self = this,
        _ = $window._,
        limit = 5;

      this.saving = false;
      this.saved = false;
      this.StartDate = oepIsoDate();
      this.booleanOptions = [{
        value: true,
        label: 'Yes'
      }, {
        value: false,
        label: 'No'
      }];

      this.companies = [
        'Visa', 'Google', 'Accenture', 'Amazon', 'Carousel', 'Facebook', 'Cisco',
        'HP', 'IBM', 'Nitrous.io', 'PayPal', 'RevolutionR', 'Salesforce', 'SAP',
        'SAS', 'Singtel', 'Viki', 'Other'
      ];

      this.maxedIntership = function(updatedCompanies) {
        // filter out companies checked out and count the remaining.
        var count = Object.keys(updatedCompanies).filter(function(key) {
          return updatedCompanies[key];
        }).length;

        return count >= limit;
      };

      /**
       * Save current user intership data
       */
      this.save = function(internship) {
        this.saving = true;
        this.saved = false;

        return oepCurrentUserApi.update({
          'internship': internship
        }).then(function() {
          self.saved = true;
        })['finally'](function() {
          self.saving = false;
        });
      };

      /**
       * Reset intership to initial intership data.
       */
      this.reset = function() {
        this.saving = false;
        this.saved = false;

        this.internship = _.cloneDeep(currentUser.info.internship);
        _.defaults(this.internship, {
          companies: {},
          dates: [],
          notification: {}
        });
      };

      this.reset();
    }
  ]);
})();
