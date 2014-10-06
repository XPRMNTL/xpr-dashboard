/* global describe, before, after, it */

'use strict';

/**
 * Required Env Vars
 */
process.env.GITHUB_ORGS = 'xprmntl,github';

/**
 * Module Dependencies
 */
var supertest = require('supertest')
  , expect = require('chai').expect;


/**
 * Local Dependencies
 */
var root = '../../../../'
  , mocks = require(root + 'test/mocks')
  , db = require(root + 'test/db')
  , helpers = require(root + 'test/server/helpers')
  , app = require(root + '/app');

/**
 * Local vars
 */
var ENDPOINT = '/api/coupling/';

describe('API Coupling interface (/api/coupling) advanced configuration:', function() {
  var devKey, sharedKey;

  before(function(done) {
    helpers.createApps([ mocks.apps.full, mocks.apps.shared ], function(err, docs) {
      if (err) return done(err);

      devKey = docs[0].dev_key;
      sharedKey = docs[1].dev_key;
      done();
    });
  });

  after(function(done) {
    db.dropDatabase(done);
  });

  describe('Given no reference defined, POST(/)', function() {
    it('should return the experiment configuration for all apps', function(done) {
      supertest.agent(app)
        .post(ENDPOINT)
        .set({
          'x-feature-key': devKey
        })
        .expect(200, function(err, resp) {
          if (err) return done(err);
          expect(resp.body).to.eql({
            app: mocks.apps.api.all
          });
          done();
        });
    });
  });

  describe('Given a reference, POST(/)', function() {
    it('should return the experiment for just that reference', function(done) {
      supertest.agent(app)
        .post(ENDPOINT)
        .set({
          'x-feature-key': devKey
        })
        .send({
          reference: 'local'
        })
        .expect(200, function(err, resp) {
          if (err) return done(err);
          expect(resp.body).to.eql({
            app: mocks.apps.api.local
          });
          done();
        });
    });

    it('should return shared exp data for just that reference', function(done) {
      supertest.agent(app)
        .post(ENDPOINT)
        .set({
          'x-feature-key': devKey,
          'x-feature-key-shared': sharedKey
        })
        .send({
          reference: 'int'
        })
        .expect(200, function(err, resp) {
          if (err) return done(err);
          expect(resp.body).to.eql({
            app: mocks.apps.api.int,
            shared: mocks.apps.api.int
          });
          done();
        });
    });
  });

});
