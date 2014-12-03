(function() {
  'use strict';

  angular.module('oep.scholarships.controllers', [
    'oep.config',
    'oep.user.services'
  ]).

  /**
   * Use to resolve `initialData` of `oepscholarshipsListCtrl`.
   *
   */
  factory('oepScholarshipsListCtrlInitialData', [
    '$q',
    'oepCurrentUserApi',
    'oepUsersApi',
    function oepScholarshipsListCtrlInitialDataFactory($q, oepCurrentUserApi, oepUsersApi) {
      return function oepScholarshipsListCtrlInitialData() {
        return $q.all({
          currentUser: oepCurrentUserApi.auth(),
          scholarships: oepUsersApi.scholarships.all(),
          availableSchools: oepUsersApi.availableSchools()
        });
      };
    }
  ]).

  /**
   * OepScholarshipsListCtrl
   *
   */
  controller('OepScholarshipsListCtrl', [
    '$window',
    '$q',
    'oepUsersApi',
    'oepSettings',
    'initialData',
    function OepScholarshipsListCtrl($window, $q, oepUsersApi, oepSettings, initialData) {
      var self = this,
        _ = $window._;

      this.loading = false;
      this.scholarships = initialData.scholarships;
      this.currentUser = initialData.currentUser;
      this.restrictionOptions = _.assign({}, oepSettings.userOptions);
      delete this.restrictionOptions.services;
      this.restrictionOptions.schools = {
        id: 'schools',
        name: 'Schools',
        choices: initialData.availableSchools
      };

      this.getMore = function(cursor) {
        if (!cursor) {
          return $q.reject(new Error('No cursor.'));
        }

        self.loading = $q.when(self.loading).then(function() {
          return oepUsersApi.scholarships.all({
            cursor: cursor
          }).then(function(scholarships) {
            self.scholarships = self.scholarships.concat(scholarships);
            self.scholarships.cursor = scholarships.cursor;
          }).finally(function() {
            self.loading = false;
          });
        });
      };
    }
  ]).

  /**
   * OepScholarshipFormCtrl
   *
   */
  controller('OepScholarshipFormCtrl', [
    '$window',
    '$timeout',
    'oepUsersApi',
    'oepSettings',
    'oepSettings',
    function OepScholarshipFormCtrl($window, $timeout, oepUsersApi, oepSettings) {
      var self = this,
        _ = $window._,
        savedTTL = 15000;

      this.services = oepSettings.userOptions.services.choices;

      this.serviceSet = function(selection, service) {
        service.id = selection.id;
        service.name = selection.name;
      };

      this.restrictionTypeChanged = function() {
        delete self.scholarship.restrictions;
      };

      this.restrictionSet = function(scholarship, restrictBy, restrictTo) {
        // TODO: add support for multiple restriction.
        scholarship.restrictions = {};
        scholarship.restrictions[restrictBy.id] = [_.pick(restrictTo, ['name', 'id'])];
      };

      this.save = function(scholarship, form) {
        this.saving = true;
        return oepUsersApi.scholarships.create(scholarship).then(function() {
          self.reset(form);
          self.saved = true;
          $timeout(function() {
            self.saved = false;
          }, savedTTL);
        }).finally(function() {
          this.saving = false;
        });
      };

      this.reset = function(form) {
        if (form && form.$setPristine) {
          form.$setPristine();
        }

        self.saving = false;
        self.saved = false;
        self.scholarship = {
          patron: {},
          service: {
            spots: 1,
            days: 1
          }
        };
        self.selectedService = null;
        self.restrictBy = null;
        self.restrictTo = null;
      };

      this.reset(true);
    }
  ]).

  /**
   * Use to resolve `initialData` of `OepSchoolarshipCtrl`.
   *
   */
  factory('oepScholarshipDetailsCtrlInitialData', [
    '$q',
    '$route',
    'oepCurrentUserApi',
    'oepUsersApi',
    function oepScholarshipDetailsCtrlInitialDataFactory($q, $route, oepCurrentUserApi, oepUsersApi) {
      return function oepScholarshipDetailsCtrlInitialData() {
        return $q.all({
          currentUser: oepCurrentUserApi.auth(),
          scholarship: oepUsersApi.scholarships.getDetails($route.current.params.scholarshipsId),
        });
      };
    }
  ]).

  /**
   * OepSchoolarshipCtrl
   *
   */
  controller('OepScholarshipDetailsCtrl', [
    '$q',
    'oepUsersApi',
    'initialData',
    function OepSchoolarshipCtrl($q, oepUsersApi, initialData) {
      var self = this;

      this.currentUser = initialData.currentUser;
      this.scholarship = initialData.scholarship;

      this.getMore = function(cursor) {
        if (!cursor) {
          return $q.reject(new Error('No cursor.'));
        }

        self.loading = $q.when(self.loading).then(function() {
          return oepUsersApi.scholarships.getDetails(self.scholarship.id, {
            cursor: cursor
          }).then(function(scholarship) {
            self.scholarship.stats = self.scholarship.stats.concat(scholarship.stats);
            self.scholarship.cursor = scholarship.cursor;
          }).finally(function() {
            self.loading = false;
          });
        });

      };
    }
  ])

  ;

})();
