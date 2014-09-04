/**
 * oep.services - root service for oep app.
 *
 */

(function() {
  'use strict';

  var interceptor = function(data, operation, what) {
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
        RestangularConfigurer.addResponseInterceptor(interceptor);
      });
    }
  ])

  ;
})();