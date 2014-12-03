(function() {
  'use strict';

  angular.module('oep.scholarships.directive', [
    'oep.user.services'
  ]).

  directive('oepScholarship', [
    '$window',
    'oepUsersApi',
    function oepScholarshipFactory($window, oepUsersApi) {
      var _ = $window._;

      return {
        templateUrl: 'scholarships/scholarships-view-scholarship.html',
        restrict: 'A',
        scope: {
          scholarship: '=oepScholarship',
          user: '=oepUser'
        },
        controller: [
          function OepScholarshipCtrl() {
            var self = this;

            this.saving = false;

            this.canApply = function(scholarship, user) {
              if (!user) {
                return false;
              }
              return oepUsersApi.scholarships.canApply(scholarship, user);
            };

            this.hasApplied = function(scholarship, user){
              return !!(
                user &&
                user.scholarshipApplications &&
                user.scholarshipApplications[scholarship.service.id] &&
                user.scholarshipApplications[scholarship.service.id].interested
              );
            };

            this.add = function(scholarship, user) {
              if (self.saving) {
                return;
              }

              if (!oepUsersApi.scholarships.canApply(scholarship, user)) {
                return;
              }

              self.saving = true;
              oepUsersApi.scholarships.addUser(scholarship, user).then(function(){
                if (!user.scholarshipApplications) {
                  user.scholarshipApplications = {};
                }

                if (!self.hasApplied(scholarship, user)) {
                  user.scholarshipApplications[scholarship.service.id] = _.pick(scholarship.service, ['id', 'name']);
                  user.scholarshipApplications[scholarship.service.id].interested = true;
                }
              }).finally(function(){
                self.saving = false;
              });
            };

            this.remove = function(scholarship, user) {
              if (self.saving) {
                return;
              }

              self.saving = true;
              oepUsersApi.scholarships.removeUser(scholarship, user).then(function(){
                delete user.scholarshipApplications[scholarship.service.id];
              }).finally(function(){
                self.saving = false;
              });
            };
          }
        ],
        controllerAs: 'ctrl'
      };
    }
  ])

  ;

})();
