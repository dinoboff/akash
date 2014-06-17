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
            name: 'services',
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
          }
        }
      };
    }
  ])

  ;

})();