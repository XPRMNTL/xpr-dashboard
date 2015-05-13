/* global describe, it */

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
  , app = require(root + '/lib/app');

/**
 * Local vars
 */
var ENDPOINT = '/api/coupling/';

describe('API Coupling interface (/api/coupling) expected error codes:', function() {

  describe('Given no x-feature-key, POST(/)', function() {
    it('should return an empty 401', function(done) {
      supertest.agent(app)
        .post(ENDPOINT)
        .set('accept', 'application/json')
        .expect(401, function(err, resp) {
          expect(resp.body).to.eql({});
          done(err);
        });
    });
  });

  describe('Given an unknown x-feature-key, POST(/)', function() {
    it('should return an empty 401', function(done) {
      supertest.agent(app)
        .post(ENDPOINT)
        .set({
          'accept': 'application/json',
          'x-feature-key': 'stranger-danger'
        })
        .expect(401, function(err, resp) {
          expect(resp.body).to.eql({});
          done(err);
        });
    });
  });

});
