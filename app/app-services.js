/**
 * oep.services - root service for oep app.
 *
 */

(function() {
  'use strict';

  var respInterceptor = function(data, operation, what) {
      var resp;

      if (operation !== 'getList') {
        return data;
      }

      if (angular.isArray(data)) {
        return data;
      }

      resp = data[what] ? data[what] : [];
      resp.cursor = data.cursor ? data.cursor : null;
      return resp;
    },
    reqInterceptor = function(element, operation, route, url, headers, params) {
      if (operation === 'remove') {
        element = null;
      }

      return {
        headers: headers,
        params: params,
        element: element,
        httpConfig: {}
      };
    };

  angular.module('oep.services', ['restangular', 'oep.config']).

  /**
   * oepApi - Oep API client.
   *
   * Build with Restangular (https://github.com/mgonto/restangular)
   *
   */
  factory('oepApi', ['Restangular', 'oepSettings',
    function(Restangular, oepSettings) {
      return Restangular.withConfig(function(RestangularConfigurer) {
        RestangularConfigurer.setBaseUrl(oepSettings.apiPath);
        RestangularConfigurer.setFullRequestInterceptor(reqInterceptor);
        RestangularConfigurer.addResponseInterceptor(respInterceptor);
      });
    }
  ])

  ;
})();
