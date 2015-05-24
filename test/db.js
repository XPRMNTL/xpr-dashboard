/* global before, after */
'use strict';

require('babel/register');

var connection = require('xpr-dash-mongodb').init('mongodb://localhost/test');

before(function(done) {
  return connection.on('open', function() {
    return connection.db.dropDatabase(done);
  });
});

after(function(done) {
  return connection.close(done);
});

module.exports = connection.db;
