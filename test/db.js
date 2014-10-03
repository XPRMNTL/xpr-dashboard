/* global before, after */
'use strict';

var connection, mongoose;

mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/test');

connection = mongoose.connection;

before(function(done) {
  return connection.on('open', function() {
    return connection.db.dropDatabase(done);
  });
});

connection.on('error', function(err) {
  // console.log('hi');
  // console.log(arguments);
});

after(function(done) {
  return connection.close(done);
});

module.exports = connection.db;
