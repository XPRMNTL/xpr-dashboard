(function() {
  'use strict';

  module.exports = setupVirtuals;

  /**
   * In this file `this` will represent the document
   */
  function setupVirtuals(Schema) {

    Schema.virtual('display_name').get(function() {
      return this.name || this.github_repo;
    });

    Schema.virtual('serialized').get(function() {
      try {
        return JSON.parse(this._serialized);
      } catch (e) {
        return {};
      }
    });
  }

})();
