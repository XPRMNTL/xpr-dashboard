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
          if (dfd) dfd.reject(err);
        };
        var win = function(resp) {
          if (cb) cb(null, resp.body, resp.headers);
          if (dfd) dfd.resolve(resp.body);
        };
        request.on('error', fail);
        request.on('response', function(resp) {
          if (resp.ok) return win(resp);

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

  GithubAPI.prototype.fetchRepos = function() {
    var dfd = Q.defer()
      , dfds = []
      , promises = []
      , appMap = {}
      , _request = this.request;

    this.orgs.map(function(orgName) {
      var dfd = Q.defer();
      dfds.push(dfd);
      promises.push(dfd.promise);

      fetchPage(1, function(err, data, headers) {
        var links = headers.link
          , _promises = []
          , matches, pages;

        if (links) {
          matches = links.match(/\?page=[^?]*\?page=(\d+)/);
          pages = parseInt(matches[1]);
          for (var i=2; i<=pages; i++) {
            _promises.push(fetchPage(i));
          }
        }
        Q.all(_promises).then(dfd.resolve);
      });

      function parseRepo(item) {
        if (! appMap[orgName]) appMap[orgName] = [];
        appMap[orgName].push({ name : item.full_name, url : item.html_url, permissions: item.permissions });
      }

      function fetchPage(page, cb) {
        var dfd = Q.defer();

        var url = 'https://api.github.com/orgs/' + orgName + '/repos?page=' + page + '&per_page=100';

        _request.get(url)
          .setCb(function(err, data, headers) {
            data.map(parseRepo);
            if (cb) cb(err, data, headers);
          }, dfd)
          .end();

        return dfd.promise;
      }
    });


    Q.all(promises)
      .then(function() {
        dfd.resolve(appMap);
      });

    return dfd.promise;
  };

})();
