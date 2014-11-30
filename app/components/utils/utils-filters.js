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

  filter('oepYesNo', [
    '$window',
    function oepYesNonFactory($window) {
      var _ = $window._;

      return function oepYesNon(v, opts) {
        opts = _.defaults(opts || {}, {
          yes: 'Yes',
          no: 'No',
          maybe: 'No'
        });

        if (angular.isArray(v)) {
          v = v.length;
        }

        if (v === undefined || v === null) {
          return opts.maybe;
        } else {
          return v ? opts.yes : opts.no;
        }
      };
    }
  ]).

  filter('oepJoin', [
    '$window',
    function oepJoinFactory($window) {
      var _ = $window._;
      return function oepJoin(list, options) {
        var values;

        options = options || {};
        _.defaults(options, {
          sep: ', ',
          lastSep: ' & ',
          value: undefined
        });

        values = _.map(list, options.value);

        if (!values || values.length === 0) {
          return '';
        } else if (values.length === 1) {
          return values[0] + '';
        } else {
          return values.slice(0, -1).join(options.sep) + options.lastSep + values.slice(-1)[0];
        }
      };
    }
  ]).

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
