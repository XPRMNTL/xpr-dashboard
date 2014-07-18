/**
 * Module Dependencies
 */
var Schema = require('mongoose').Schema;

/**
 * MongooseJS Schema Declaration
 */
module.exports = new Schema({
  name : {
    type: String,
    index: { unique: true },
  },
  description: String,
  dev_key : {
    type: String,
    index: { unique: true },
  },
  github_url : {
    type: String,
    index: { unique: true },
  },
  date_modified : {
    type: Date,
    default: Date.now,
  },
  last_seen : Date,
});

// FUTURE
// experiments
// authorized users
