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
        for (ref in references) {
          if (references.hasOwnProperty(ref)) {
            if (envs && (! envs[ref])) envs[ref] = {};
            val = references[ref];
            if (typeof val === 'boolean') {
              if (refFlag) {
                experiments[name] = val;
              } else {
                envs[ref][name] = val;
              }
            }
            if (typeof val === 'object' && typeof val.length === 'number') {
              if (refFlag) {
                experiments[name] = val.map(cleanGroupList);
              } else {
                envs[ref][name] = val.map(cleanGroupList);
              }
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
