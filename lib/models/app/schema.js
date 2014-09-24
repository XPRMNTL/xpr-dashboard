/**
 * Module Dependencies
 */
var Schema = require('mongoose').Schema
  , ExperimentSchema = require('../experiment/schema');

/**
 * MongooseJS Schema Declaration
 */
module.exports = new Schema({
  name : {
    type: String,
    index: { unique: true, sparse: true },
  },
  description: String,
  dev_key : {
    type: String,
    index: { unique: true },
  },
  github_repo : {
    type: String,
    index: { unique: true },
  },
  groups : {
    type : Schema.Types.Mixed,
    default : {},
  },
  references : {
    type : Array,
    'default' : [ 'local', 'int', 'beta', 'prod' ],
  },
  experiments : [ ExperimentSchema ],
  date_modified : {
    type: Date,
    default: Date.now,
  },
  last_seen : Date,
}, {
  toJSON: {
    virtuals: true
  }
});

// FUTURE
// experiments
// authorized users
