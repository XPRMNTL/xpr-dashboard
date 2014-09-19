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
    // index: { unique: true }, // This is no good at the moment. It works across apps, and I don't want that
  },
  description: String,
  value: {
    type: Boolean,
    default: false,
  },
  references : Schema.Types.Mixed,
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
