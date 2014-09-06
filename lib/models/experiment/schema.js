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
  value : Boolean,
  references : Schema.Types.Mixed,
  type: String,
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
