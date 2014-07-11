(function() {
  'use strict';

  var Q = require('q')
    , superagent = require('superagent-defaults')()
    // , debug = require('debug')('xaas:lib:github')
  ;

  module.exports = GithubAPI;

  function GithubAPI(user, token) {
    this.user = user;

    this.request = superagent.on('request', function(request) {
      request.set('Accept', 'application/vnd.github.raw+json');
      if (token) request.auth(token, 'x-oauth-basic');
      return request;
    });

    return this;
  }

  GithubAPI.prototype.fetchTeams = function(cb) {
    var url = 'https://api.github.com/user/teams'
      , dfd = Q.defer()
      , responders = this._getResponders(cb, dfd);

    this.request
      .get(url)
      .on('error', responders.fail)
      .end(function(resp) {
        return (resp.ok) ? responders.win(resp.body) : responders.fail('fetchTeams failed');
      });

    return dfd.promise;
  };

  GithubAPI.prototype.filterTeams = function(teams) {
    var fsTeams = {
      'fs-webdev' : [],
      'fs-eng' : []
    };

    teams.map(function(item) {
      var org = item.organization.login;
      if (! ~['fs-eng','fs-webdev'].indexOf(org)) return;
      if (item.permission === 'pull') return;

      fsTeams[org].push(item.name);
    });

    if (! (fsTeams['fs-webdev'].length || fsTeams['fs-eng'].length)) throw { message: 'Not a Member of required Orgs', name: 'NOT_AUTHORIZED' };

    return fsTeams;
  };

  GithubAPI.prototype._getResponders = function(cb, dfd) {
    return {
      win : function(data) {
        if (cb) cb(null, data);
        return dfd.resolve(data);
      },
      fail : function(err) {
        if (typeof err === 'string') {
          err = new Error(err);
        }

        if (cb) cb(err);
        return dfd.reject(err);
      }
    };
  };

})();
