/**
 * oep.config - Config for oep app.
 *
 */
(function() {
  'use strict';

  angular.module('oep.config', []).

  /**
   * oepSettings - Default setting for oep app.
   *
   */
  factory('oepSettings', ['$window',
    function(window) {
      var _ = window._;

      function simpleId(value) {
        value = value + '';
        return {
          id: value.toLowerCase().replace(/\s+/g, '-'),
          name: value
        };
      }

      return {
        apiPath: '/api/v1',
        rankingOptions: [{
          id: 'totalBadges',
          label: 'Total Badges'
        }, {
          id: 'score',
          label: 'Total Score'
        }, {
          id: 'treeHouse',
          label: 'Treehouse Badges'
        }, {
          id: 'codeSchool',
          label: 'Code School Badges'
        }, {
          id: 'codeCombat',
          label: 'Code Combat Badges'
        }, {
          id: 'treeHousePoints',
          label: 'Threehouse Score'
        }, {
          id: 'codeSchoolPoints',
          label: 'Code School Score'
        }, {
          id: 'codeCombatPoints',
          label: 'Code Combat Score'
        }],
        userOptions: {
          gender: {
            id: 'gender',
            name: 'Gender',
            choices: _.map(['Female', 'Male'], simpleId)
          },
          yearOfBirth: {
            id: 'yearOfBirth',
            name: 'Year of Birth',
            choices: _.map(['Before 1980'].concat(
              _.range(1980, new Date().getFullYear())
            ), simpleId)
          },
          services: {
            id: 'services',
            name: 'Services',
            choices: [{
              id: 'treeHouse',
              name: 'Treehouse'
            }, {
              id: 'codeSchool',
              name: 'Code School'
            }, {
              id: 'codeCombat',
              name: 'Code Combat'
            }]
          },
          schoolType: {
            id: 'schoolType',
            name: 'School Type',
            choices: [{
              id: 'Secondary',
              name: 'Secondary'
            }, {
              id: 'Junior College',
              name: 'Junior College'
            }, {
              id: 'Polytechnic',
              name: 'Polytechnic'
            }, {
              id: 'University',
              name: 'University'
            }, {
              id: 'Other',
              name: 'Other'
            }]
          }
        }
      };
    }
  ])

  ;

})();
