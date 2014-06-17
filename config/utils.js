/* global browser */

var fs = require('fs');

exports.onPrepare = function(config) {
  'use strict';

  var tss = function(name, res) {
    var path = './screenshots/' +
      res.width + 'x' + res.height +
      '-' + name + '.png';

    return browser.driver.manage().window().setSize(res.width, res.height).then(function() {
      return browser.takeScreenshot();
    }).then(function(png) {
      var stream = fs.createWriteStream(path);

      stream.write(new Buffer(png, 'base64'));
      stream.end();

      return png;
    });
  };

  global.takeScreenShot = function(name) {
    return config.resolutions.reduce(function(promise, res) {
      if (!promise.then) {
        promise = tss(name, promise);
      }
      return promise.then(function() {
        return tss(name, res);
      });
    });
  };
};