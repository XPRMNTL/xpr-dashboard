'use strict';

/**
 * Module Dependencies
 */
import superagentDefaults from 'superagent-defaults';
import debugLib from 'debug';
import Promise from 'bluebird';

/**
 * Local Constants
 */
const superagent = superagentDefaults();
const debug = debugLib('feature:lib:github');


/**
 * Export the Class
 */
export default class GithubAPI {


  constructor(user, token) {
    this.user = user;

    this.request = superagent.on('request', (request) => {
      request.set('Accept', 'application/vnd.github.raw+json');
      if (token) request.auth(token, 'x-oauth-basic');

      request.setCb = (cb, dfd) => {
        var fail = (err) => {
          if (typeof err === 'string') {
            err = new Error(err);
          }

          if (cb) cb(err);
          if (dfd) dfd.reject(err);
        };
        var win = (resp) => {
          if (cb) cb(null, resp.body, resp.headers);
          if (dfd) dfd.resolve(resp.body);
        };
        request.on('error', fail);
        request.on('response', (resp) => {
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


  fetchOrgs(cb) {
    let url = 'https://api.github.com/user/orgs';

    return new Promise((resolve, reject) => {
      this.request
        .get(url)
        .setCb(cb, { resolve: resolve, reject: reject })
        .end();
    });
  }


  filterOrgs(orgs) {
    let okOrgs = this.orgs
    let isMember = false;

    orgs.map((org) => {
      if (~ okOrgs.indexOf(org.login.toLowerCase())) isMember = true;
    });

    if (! isMember) throw { message: 'Not a Member of required Orgs', name: 'NOT_AUTHORIZED' };
  }


  fetchRepos() {
    return new Promise((resolve) => {
      let appMap = {};
      let _request = this.request;

      let promises = this.orgs.map((orgName) => {
        return new Promise((resolve) => {
          fetchPage(1, (err, data, headers) => {
            let links = headers.link;
            let _promises = [];
            let matches, pages;

            if (links) {
              matches = links.match(/\?page=[^?]*\?page=(\d+)/);
              pages = parseInt(matches[1]);
              for (let i=2; i<=pages; i++) {
                _promises.push(fetchPage(i));
              }
            }
            Promise.all(_promises).then(resolve);
          });

          function parseRepo(item) {
            if (! appMap[orgName]) appMap[orgName] = [];
            appMap[orgName].push({ name : item.full_name, url : item.html_url, permissions: item.permissions });
          }

          function fetchPage(page, cb) {
            return new Promise((resolve, reject) => {
              var url = `https://api.github.com/orgs/${orgName}/repos?page=${page}&per_page=100`;

              _request.get(url)
                .setCb(function(err, data, headers) {
                  data.map(parseRepo);
                  if (cb) cb(err, data, headers);
                }, { resolve: resolve, reject: reject })
                .end();
            });
          }
        });
      });

      Promise.all(promises)
        .then(function() {
          resolve(appMap);
        });
    });
  }

}
