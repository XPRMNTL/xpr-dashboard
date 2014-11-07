/**
 * Module Dependencies
 */
var Q = require('q')
  , debug = require('debug')('feature:models:app:methods');

module.exports = setupMethods;

/**
 * In this file `this` will represent the Document
 */
function setupMethods(Schema) {
  Schema.methods.serialize = serialize;
  Schema.methods.generateSerialized = generateSerialized;
}

function generateSerialized() {
  var serialized = {
      groups: this.groups,
      envs: {},
    }
    , experiments = serialized.experiments = {}
    , envs = serialized.envs;

  this.experiments.map(function(item) {
    var references = item.references
      , name = item.name
      , ref, val;

    experiments[name] = item.value;

    if (! references) return;

    // If the refFlag is set, overwrite it or nothing.
    // if (refFlag) {
    //   val = references[refFlag];

    //   // If there was no override, just leave it as is.
    //   if (undefined === val) return;

    //   // Set Groups list
    //   if (typeof val === 'object' && typeof val.length === 'number')  {
    //     return (experiments[name] = val.map(cleanGroupList));
    //   }

    //   // Set the booleans
    //   return (experiments[name] = val);
    // }

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

  this._serialized = JSON.stringify(serialized);
}

function serialize(cb) {
  var dfd = Q.defer()
    , doc = this;

  this.generateSerialized();

  var serialized = this.serialized;

  this.save(function(err) {
    if (err) {
      console.info('count#xprmntl.serialize_save.fail=1 error="' + err.message + '"');
      if (cb) cb(err);
      return dfd.reject(err);
    }

    if (cb) cb(null, this);
    dfd.resolve(this);
  });

  return dfd.promise;
}

function cleanGroupList(item) {
  if (typeof item === 'string') return item;
  if (typeof item.min === 'number' && typeof item.max === 'number') return '' + item.min + '-' + item.max + '%';
}
