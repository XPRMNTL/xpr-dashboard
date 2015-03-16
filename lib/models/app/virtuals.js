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
      var serializedData = null;
      try {
        if (this._serialized) {
          serializedData = JSON.parse(this._serialized);
        } else {
          console.warn("No '_serialized' field found for app '%s'.", this.name);
        }
      } catch (e) {
        console.warn("Unable to parse '_serialized' field into JSON for app '%s'.", this.name);
      }
      return serializedData;
    });
  }
})();
