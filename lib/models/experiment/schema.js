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
  type: String,
  values: {
    boolean: Boolean,
    reference: {
      local: Boolean,
      beta: Boolean,
      prod: Boolean
    },
  },
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
