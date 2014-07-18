/**
 * Module Dependencies
 */
var Schema = require('mongoose').Schema;

/**
 * MongooseJS Schema Declaration
 */
module.exports = new Schema({
  repo_list : Schema.Types.Mixed,
  date_modified : {
    type: Date,
    default: Date.now,
  },
});

// FUTURE
// experiments
// authorized users
