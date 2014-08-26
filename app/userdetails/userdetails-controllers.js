/**
 * oep.userdetails.controllers - Module for userdetails subsection controllers.
 *
 * Defines:
 *
 * - OepUserCtrl
 */

(function() {
  'use strict';

  var googleNickNamePattern = /([^@]+)(@.+)?/,
    userIdFilterPattern = /[^-\w\d.]/g;


  /**
   * Convert a name to an id.
   *
   */
  function defaultId(name) {
    var n = defaultName(name);
    return n.replace(userIdFilterPattern, '');
  }

  /**
   * Convert a gmail account nickname to a name.
   */
  function defaultName(name) {
    return googleNickNamePattern.exec(name)[1];
  }

  /**
   * OepUserCtrl - Controller for the user profile page.
   *
   * Requires the current user info which it uses to populate the scope
   * `profile` property.
   *
   * It will also check that the badge info are up to date.
   *
   */
  function OepUserCtrl(user, userApi, reportCardApi, currentUserApi) {
    var self = this;

    //quick hack

    
    this.userApi = userApi;
    this.reportCardApi = reportCardApi;
    this.profile = user;
    this.currentUser = null;

    if (!user || !user.services) {
      return;
    }

    currentUserApi.auth().then(function(info) {
      self.currentUser = info;
    });

    this.checkBadges(user.services);
  }

  /**
   * Check the user badges data are out of date and query the server
   * for new ones if they are.
   *
   */
  OepUserCtrl.prototype.checkBadges = function(services) {
    var self = this;

    this.reportCardApi.checkStats(services).then(function(shouldUpdate) {
      if (!shouldUpdate) {
        return;
      }

      return self.userApi.getById(self.profile.id).then(function(info) {
        self.profile.services = info.services;
        self.checkBadges(info.services);
      });
    });
  };

  /**
   * OepUserFormListCtrl - Controller for the user settings form.
   *
   * TODO: move the logic to extract the referrer out into a service.
   *
   */
  function OepUserFormListCtrl($location, $window, currentUserApi, usersApi, settings, user, availableSchools, availableCourses) {
    var $ = $window.jQuery,
      _ = $window._,
      search = $window.location.search,
      refPattern = /\?([^&]+&)*ref=([^&]+)(&.*)?/,
      match = refPattern.exec(search);

    this.$ = $;
    this._ = _;
    this.location = $location;
    this.alert = $window.alert;
    this.currentUserApi = currentUserApi;
    this.usersApi = usersApi;
    this.saving = false;
    this.userIdPattern = /^[-\w\d.]+$/;
    this.isNewUser = !user.info;
    this.user = $.extend({}, user);
    this.ref = match && match.length > 2 ? match[2] : null;
    this.options = $.extend({}, settings.userOptions);
    this.options.schools = {
      choices: availableSchools
    };

    this.newCourse = {
      selected: {},
      allCourses: availableCourses,
      available: _.filter(availableCourses, function(course) {
        if (!user.info || !user.info.courses) {
          return course;
        }
        return !_.find(user.info.courses, {id: course.id});
      })
    };

    if (!this.user.info) {
      this.newUserInfo();
    }


    if (!this.user.info.id) {
      this.user.info.id = defaultId(user.name);
      this.user.info.name = defaultName(user.name);
    }
  }

  OepUserFormListCtrl.prototype = {

    /**
     * reset new user values.
     *
     */
    newUserInfo: function() {
      this.user.info = {};
      if (this.ref) {
        this.user.info.referredBy = this.ref;
      }
    },

    /**
     * Save/create user info.
     *
     */
    save: function(userInfo) {
      var self = this;

      this.saving = true;
      this.currentUserApi.save(userInfo).then(function() {
        self.currentUserApi.reset();
        self.location.path('/');
        self.saving = false;
      });
    },

    /**
     * Join a course.
     *
     */
    addCourse: function(course, pwField) {
      var self = this;

      this.usersApi.courses.join(course, this.user.info).then(function(result) {
        delete course.id;
        delete course.pw;
        self.user.info.courses.push(result);
        self.newCourse.available = self._.remove(
          self.newCourse.available, {id: result.id}
        );
      }).catch(function(resp) {
        if (resp.status === 403) {
          pwField.$setValidity('wrongPassword', false);
        } else {
          self.alert('Failed to register you to the course.');
        }
      });
    }
  };

  // Summary controller
  function SummaryController(oepUsersApi) {
    var self = this;

    oepUsersApi.getSummary().then(function(summary) {
      self.summary = summary;
    });

  }

  angular.module('oep.userdetails.controllers', ['oep.config', 'oep.user.services', 'eop.card.directives', 'eop.card.services']).

  controller('OepUserCtrl', ['user', 'oepUsersApi', 'eopReportCardApi', 'oepCurrentUserApi', '$q', OepUserCtrl]).
  controller('OepUserFormListCtrl', [
    '$location',
    '$window',
    'oepCurrentUserApi',
    'oepUsersApi',
    'oepSettings',
    'user',
    'availableSchools',
    'availableCourses',
    OepUserFormListCtrl
  ]).
  controller('SummaryController', ['oepUsersApi', SummaryController]);

})();