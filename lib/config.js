/**
 * Installation-specific configuration
 *
 * I _think_ this is how I want to do it
 */

/**
 * `datastore` should be configured.
 */
import _datastore from 'xpr-dash-couchdb';
import datastore from 'xpr-dash-mongodb';


/**
 * Initialize the datastore
 */
if (process.env.NODE_ENV !== 'test') {
  datastore.init(process.env.dataStoreURL || process.env.MONGOHQ_URL, 'a_xprmntl_apps');
}
if (process.env.NODE_ENV !== 'test') {
  datastore.init(process.env.COUCHDB_URL, 'a_xprmntl_apps');
}

/**
 * Export the datastore
 */
export default datastore;














// /**
//  * Determines which datastore to use
//  *
//  * One of [ 'mongodb', ];
//  *
//  * @type {String}
//  */
// var _storeName = 'mongodb';

// var store = getStore(_storeName);

// module.exports = store;

// function getStore(type) {
//   var stores = {
//     mongodb: function() {
//       var datastore = require('xpr-dash-mongodb');

//       if (process.env.NODE_ENV !== 'test') {
//         datastore.init(process.env.MONGOHQ_URL);
//       }

//       return datastore;
//     },
//     couchdb: function() {
//       var datastore = require('xpr-dash-couchdb');

//       if (process.env.NODE_ENV !== 'test') {
//         datastore.init(process.env.COUCHDB_URL, 'a_xprmntl_apps');
//       }

//       return datastore;
//     }
//   };


//   return stores[type] && stores[type]();
// }

// var couchdbstore = getStore('couchdb');
