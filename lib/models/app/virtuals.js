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
          envs: {},
        }
        , experiments = serialized.experiments = {}
        , envs = serialized.envs = {};

      this.experiments.map(function(item) {
        var references = item.references
          , name = item.name
          , ref, val;

        experiments[name] = item.value;

        if (! references) return;
        for (ref in references) {
          if (references.hasOwnProperty(ref)) {
            if (! envs[ref]) envs[ref] = {};
            val = references[ref];
            if (typeof val === 'boolean') envs[ref][name] = val;

            if (typeof val === 'object' && typeof val.length === 'number') {
              envs[ref][name] = val.map(cleanGroupList);
            }
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
