var utils = require('./utils');


// An example configuration file.
exports.config = {
  seleniumAddress: 'http://0.0.0.0:4444/wd/hub',

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'phantomjs',

    'phantomjs.binary.path': './node_modules/phantomjs/bin/phantomjs',

    /*
     * Command line arugments to pass to phantomjs.
     * Can be ommitted if no arguments need to be passed.
     * Acceptable cli arugments: https://github.com/ariya/phantomjs/wiki/API-Reference#wiki-command-line-options
     */
    'phantomjs.cli.args': []
  },

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  },

  onPrepare: utils.onPrepare({
    resolutions: [{
      width: 1024,
      height: 768
    }, {
      width: 320,
      height: 568
    }]
  })
};