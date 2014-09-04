// Karma configuration
// Generated on Mon Mar 24 2014 17:34:54 GMT+0000 (GMT)

var baseSettings = require('./karma.base.conf.js');

module.exports = function(config) {
  'use strict';

  baseSettings.logLevel = config.LOG_INFO;

  config.set(baseSettings);
};
