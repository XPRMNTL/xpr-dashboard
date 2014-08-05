(function(){
  'use strict';

  /**
   * Module Dependencies
   */
  var mongoose = require('mongoose')
    , fs = require('fs');

  module.exports = function(name, dir) {
    if (! (name && dir)) throw new Error ('name and dir required for model factory');
    if (! fs.existsSync(dir + '/schema.js')) throw new Error(name + ' Schema not defined!');

    var schema = require(dir + '/schema');

    // Hook up the statics and hooks iff exist
    if (fs.existsSync(dir + '/hooks.js')) require(dir + '/hooks')(schema);
    if (fs.existsSync(dir + '/statics.js')) require(dir + '/statics')(schema);
    if (fs.existsSync(dir + '/virtuals.js')) require(dir + '/virtuals')(schema);

    return mongoose.model(name, schema);
  };

})();
