(function() {
  'use strict';

  var Q = require('q')
    , superagent = require('superagent-defaults')()
    , debug = require('debug')('feature:lib:github')
  ;

  module.exports = GithubAPI;

  function GithubAPI(user, token) {
    this.user = user;

    this.request = superagent.on('request', function(request) {
      request.set('Accept', 'application/vnd.github.raw+json');
      if (token) request.auth(token, 'x-oauth-basic');

      request.setCb = function(cb, dfd) {
        var fail = function(err) {
          if (typeof err === 'string') {
            err = new Error(err);
          }

          if (cb) cb(err);
          return dfd.reject(err);
        };
        var win = function(data) {
          if (cb) cb(null, data);
          return dfd.resolve(data);
        };
        request.on('error', fail);
        request.on('response', function(resp) {
          if (resp.ok) return win(resp.body);

          debug('Request failed: ' + resp.status);
          return fail('Request failed');
        });
        return request;
      };

      return request;
    });

    return this;
  }

  GithubAPI.prototype.fetchOrgs = function(cb) {
    var url = 'https://api.github.com/user/orgs'
      , dfd = Q.defer();

    this.request
      .get(url)
      .setCb(cb, dfd)
      .end();

    return dfd.promise;
  };

  GithubAPI.prototype.filterOrgs = function(orgs) {
    var okOrgs = this.orgs
      , isMember = false;
    orgs.map(function(org) {
      if (~ okOrgs.indexOf(org.login)) isMember = true;
    });

    if (! isMember) throw { message: 'Not a Member of required Orgs', name: 'NOT_AUTHORIZED' };
  };

  GithubAPI.prototype.fetchTeams = function(cb) {
    var url = 'https://api.github.com/user/teams'
      , dfd = Q.defer();

    this.request
      .get(url)
      .setCb(cb, dfd)
      .end();

    return dfd.promise;
  };

  GithubAPI.prototype.filterTeams = function(teams) {
    var orgs = this.orgs;
    var ourTeams = {};

    teams.map(function(item) {
      var org = item.organization.login;
      if (! ~orgs.indexOf(org)) return;
      if (item.permission === 'pull') return;
      if (! ourTeams[org]) ourTeams[org] = [];

      ourTeams[org].push(item.name);
    });

    return ourTeams;
  };

})();
