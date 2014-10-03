/* global describe, before, beforeEach, after, afterEach, it */

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

describe('API Coupling interface (/api/coupling) for basic configurations:', function() {

  after(function(done) {
    db.dropDatabase(done);
  });

  describe('When adding experiments for the first time, POST(/)', function() {

    var devKey, _docs;

    beforeEach(function(done) {
      helpers.createApps([
        { 'github_repo': 'example/example1' }
      ], function(err, docs) {
        if (err) return done(err);
        _docs = docs;
        devKey = docs[0].dev_key;
        done();
      });
    });

    afterEach(function(done) {
      helpers.deleteApps(_docs, function() {
        done();
      });
    });

    /**
     * We're just testing to make sure they don't accidentally break
     * by leaving something out
     */
    describe('Given no experiments list, ', function() {

      it('should reply with an empty experiments list', function(done) {
        supertest.agent(app)
          .post(ENDPOINT)
          .set({
            'accept': 'application/json',
            'x-feature-key': devKey
          })
          .expect(200, function(err, resp) {
            if (err) return done(err);

            expect(resp.body).to.eql({
              app: {
                groups: {},
                experiments: {},
                envs: {}
              }
            });
            done();
          });
      });
    });

    it('should add all data and send back defaulted configs', function(done) {

      supertest.agent(app)
        .post(ENDPOINT)
        .set({
          'accept': 'application/json',
          'x-feature-key': devKey
        })
        .send(mocks.raw.simple)
        .expect(200, function(err, resp) {
          if (err) return done(err);

          expect(resp.body).to.eql(mocks.api.simple);
          done();
        });

    });

  });

  describe('When fetching experiments, POST(/)', function() {

    var devKey, sharedKey, _docs;

    before(function(done) {
      helpers.createApps([
        { 'github_repo': 'example/example2' },
        { 'github_repo': 'example/shared2' }
      ], function(err, docs) {
        if (err) return done(err);
        _docs = docs;
        devKey = docs[0].dev_key;
        sharedKey = docs[1].dev_key;
        done();
      });
    });

    after(function(done) {
      helpers.deleteApps(_docs, function() {
        done();
      });
    });

    describe('Given no shared header', function() {

      it('should send back all existing experiments', function(done) {

        supertest.agent(app)
          .post(ENDPOINT)
          .set({
            'accept': 'application/json',
            'x-feature-key': devKey
          })
          .send(mocks.raw.simple)
          .expect(200, function(err, resp) {
            if (err) return done(err);

            expect(resp.body).to.eql(mocks.api.simple);
            done();
          });
      });
    });

    describe('Given shared header', function() {

      it('should create and include shared data', function(done) {

        supertest.agent(app)
          .post(ENDPOINT)
          .set({
            'accept': 'application/json',
            'x-feature-key': devKey,
            'x-feature-key-shared': sharedKey
          })
          .send(mocks.raw.simpleShared)
          .expect(200, function(err, resp) {
            if (err) return done(err);

            expect(resp.body).to.eql(mocks.api.simpleShared);
            done();
          });
      });
    });

  });

});
