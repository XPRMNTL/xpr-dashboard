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
      var serialized = {
          groups: this.groups,
        }
        , experiments = serialized.experiments = {}
        , refFlag = this.refFlag
        , envs;

      if (! refFlag) envs = serialized.envs = {};

      this.experiments.map(function(item) {
        var references = item.references
          , name = item.name
          , ref, val;

        experiments[name] = item.value;

        if (! references) return;

        // If the refFlag is set, overwrite it or nothing.
        if (refFlag) {
          val = references[refFlag];

          // If there was no override, just leave it as is.
          if (undefined === val) return;

          // Set Groups list
          if (typeof val === 'object' && typeof val.length === 'number')  {
            return (experiments[name] = val.map(cleanGroupList));
          }

          // Set the booleans
          return (experiments[name] = val);
        }

        for (ref in references) {
          if (references.hasOwnProperty(ref)) {
            if (envs && (! envs[ref])) envs[ref] = {};
            val = references[ref];

            // Sets Groups list
            if (typeof val === 'object' && typeof val.length === 'number') {
              return (envs[ref][name] = val.map(cleanGroupList));
            }

            // Set the booleans
            return (envs[ref][name] = val);
          }
        }
      });

      return serialized;
    });
  }

  function cleanGroupList(item) {
    if (typeof item === 'string') return item;
    if (typeof item.min === 'number' && typeof item.max === 'number') return '' + item.min + '-' + item.max + '%';
  }

})();
