(function() {
  'use strict';

  var rtg, rClient, fakeRClient
    , redis = require('redis');

  var REDISTOGO_URL = process.env.REDISTOGO_URL;

  var inMemBad = {};

  fakeRClient = {
    get : function(name, cb) {
      cb(null, inMemBad[name]);
    },
    set : function(name, data) {
      inMemBad[name] = data;
    },
    expire : function() {},
    on: function() {}
  };

  try {
    // Check for Heroku vs localhost
    if (REDISTOGO_URL) {
      rtg = require('url').parse(REDISTOGO_URL);
      rClient = redis.createClient(rtg.port, rtg.hostname);
      // url.parse doesn't split username / password
      rClient.auth(rtg.auth.split(':')[1]);

      rClient.on('error', function(err) {
        console.error('Error ' + err);
      });

      // It seems this causes the process to not stop
      // process.on('SIGTERM', function() {
      //   rClient.quit();
      // });
    } else {
      // Mock redis when not available.
      rClient = fakeRClient;
    }

  } catch (e) {
    // Mock redis when not available.
    rClient = fakeRClient;
  }

  rClient.getFakeClient = fakeRClient;

  module.exports = rClient;

})();
