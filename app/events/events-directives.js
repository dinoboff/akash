(function() {
  'use strict';

  /**
   * Compare array values
   */
  function compareArray(a, b) {
    for (var i = 0; i < a.length; i++) {
      if (b.length <= i || a[i] > b[i]) {
        return 1;
      } else if (a[i] < b[i]) {
        return -1;
      }
    }
    if (b.length > a.length) {
      return -1;
    } else {
      return 0;
    }
  }

  angular.module('oep.events.directives', []).

  directive('oepEvent', [

    function oepEventFactory() {
      return {
        templateUrl: 'events/events-view-event.html',
        restrict: 'A',
        scope: {
          event: '=oepEvent',
          user: '=oepUser'
        },
        controller: [
          '$scope',
          '$window',
          'oepEventsApi',
          function OepEventCtrl($scope, $window, oepEventsApi) {
            var self = this,
              _ = $window._,
              moment = $window.moment,
              today = function() {
                return moment.utc().toArray().slice(0, 3);
              };

            this.canJoin = function() {
              var eventCutoff = moment.utc($scope.event.cutoffDate).toArray().slice(0, 3);

              return compareArray(eventCutoff, today()) >= 0;
            };

            this.hasJoined = function(user) {
              if (!user || !user.events) {
                return false;
              }

              return _.find(user.events, {
                id: $scope.event.id
              }) !== undefined;
            };

            this.add = function(user, password) {
              var joinPromise;

              this.saving = true;
              this.saved = false;

              if ($scope.event.visibility === 'private') {
                joinPromise = oepEventsApi.addParticipant($scope.event, user.id, password);
              } else {
                joinPromise = oepEventsApi.addParticipant($scope.event, user.id);
              }

              return joinPromise.then(function() {
                user.events.push($scope.event);
                self.saved = true;
              }).catch(function(resp) {
                if (resp.status === 403) {
                  self.wrongPassword = true;
                } else {
                  console.log('Errors: ', resp);
                }
              })['finally'](function() {
                self.saving = false;
              });
            };

            this.remove = function(user) {
              this.saving = true;
              this.saved = false;

              return oepEventsApi.removeParticipant($scope.event, user.id).then(function() {
                self.saved = true;
                _.remove(user.events, {
                  id: $scope.event.id
                });
                _.remove($scope.event.stats, {
                  id: user.id
                });
              })['finally'](function() {
                self.saving = false;
              });
            };
          }
        ],
        controllerAs: 'ctrl',
      };
    }
  ]);

})();
