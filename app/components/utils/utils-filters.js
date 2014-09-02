/**
 * oep.utils.filters - Miscellaneous Filters.
 *
 * Defines:
 *
 * - oepEmpty.
 *
 */
(function() {
  'use strict';

  angular.module('oep.utils.filters', []).

  filter('oepEmpty', [
    '$window',
    function($window) {
      return function(obj) {
        if (!obj) {
          return true;
        }

        if (obj.length !== undefined) {
          return obj.length === 0;
        }

        return $window._.keys(obj).length === 0;
      };
    }
  ]).

  filter('oepPick', ['$window',
    function oepPickFactory($window) {
      var _ = $window._;

      function splitPath(path) {
        var parts = _.reduce(path, function(parts, ch) {
            var lastPart = parts.slice(-1).pop();

            switch (ch) {
            case '[':
            case '.':
              parts.push([]);
              break;
            case '\'':
            case '"':
            case ']':
              break;
            default:
              lastPart.push(ch);
            }

            return parts;
          }, [
            []
          ]);

        return _.map(parts, function(part) {
          return part.join('');
        });
      }

      return function oepPick(obj, property) {
        var path = splitPath(property),
          result = _.pick(obj, path[0]),
          currTarget = result,
          lastProp = path[0];

        _.forEach(path.slice(1), function(prop) {
          if (!currTarget) {
            return;
          }

          currTarget[lastProp] = _.pick(currTarget[lastProp], prop);
          lastProp = prop;
          currTarget = currTarget[lastProp];
        });

        return result;
      };
    }
  ])

  ;

})();