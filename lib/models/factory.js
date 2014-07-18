(function(){
  'use strict';

  /**
   * Module Dependencies
   */
  var mongoose = require('mongoose')
    , fs = require('fs');

  module.exports = function(name, dir) {
    if (! (name && dir)) throw new Error ('name and dir required for model factory');
    if (! fs.existsSync(dir + '/schema')) throw new Error(name + ' Schema not defined!');

    var schema = require(dir + '/schema');

    // Hook up the statics and hooks iff exist
    if (fs.existsSync(dir + '/statics')) require('./statics')(schema);
    if (fs.existsSync(dir + '/hooks')) require('./hooks')(schema);

    return mongoose.model(name, schema);
  };

})();
