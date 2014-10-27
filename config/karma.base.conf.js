// Karma configuration
// Generated on Mon Mar 24 2014 17:34:54 GMT+0000 (GMT)

module.exports = {

  // base path that will be used to resolve all patterns (eg. files, exclude)
  basePath: '..',


  // frameworks to use
  // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
  frameworks: ['jasmine'],

  // list of files / patterns to load in the browser
  files: [
    'app/lib/jquery/dist/jquery.js',
    'app/lib/lodash/dist/lodash.js',
    'app/lib/angular/angular.js',
    'app/lib/angular-route/angular-route.js',
    'app/lib/restangular/dist/restangular.js',
    'app/lib/bootstrap/js/collapse.js',
    'app/lib/bootstrap/js/tooltip.js',
    'app/lib/angular-loading-bar/build/loading-bar.js',
    'app/lib/moment/moment.js',
    'app/lib/angular-mocks/angular-mocks.js',
    'app/*.js',
    'app/navbar/*.js',
    'app/ranks/*.js',
    'app/suggestions/*.js',
    'app/userdetails/*.js',
    'app/events/*.js',
    'app/components/**/*.js'
  ],


  // list of files to exclude
  exclude: [
    'app/**/*.e2e.specs.js',
    'app/app-mock.js'
  ],


  // preprocess matching files before serving them to the browser
  // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
  preprocessors: {

  },


  // test results reporter to use
  // possible values: 'dots', 'progress'
  // available reporters: https://npmjs.org/browse/keyword/karma-reporter
  reporters: ['progress'],


  // web server port
  port: 9876,


  // enable / disable colors in the output (reporters and logs)
  colors: true,


  // level of logging
  // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
  // logLevel: config.LOG_INFO,


  // enable / disable watching file and executing tests whenever any file changes
  autoWatch: true,


  // start these browsers
  // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
  browsers: ['PhantomJS'],


  // Continuous Integration mode
  // if true, Karma captures browsers, runs the tests and exits
  singleRun: false,
};
