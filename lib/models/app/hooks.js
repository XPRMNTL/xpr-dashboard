(function() {
  'use strict';

  /**
   * Module Dependencies
   */
  var uuid = require('node-uuid')
    , debug = require('debug')('feature:models:app:hooks');

  module.exports = setupHooks;

  /**
   * In this file `this` will represent the document
   */
  function setupHooks(Schema) {
    // Create the Dev Key
    Schema.pre('save', function(next) {
      if (this.dev_key) return next();
      this.dev_key = uuid.v4();
      next();
    });

    // Set date_modified
    Schema.pre('save', function(next) {
      debug('setting date_modified on App: ' + this.github_repo);
      this.date_modified = new Date();
      next();
    });
  }

})();
