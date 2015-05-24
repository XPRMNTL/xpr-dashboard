'use strict';

/**
 * Module Dependencies
 */
import passport from 'passport';
import { Strategy as GithubStrategy } from 'passport-github';

/**
 * Local dependencies
 */
import GithubAPI from '../../utils/githubAPI';

/**
 * Local Constants
 */
const githubConfig = {
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackUrl: process.env.BASE_URL + '/auth/github/callback'
};

export default function (app) {
  passport.use('github', new GithubStrategy(githubConfig, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => {
      return done(null, {
        'accessToken': accessToken,
        'refreshToken': refreshToken,
        'profile': profile
      });
    });
  }));

  app.get('/auth/github', passport.authenticate('github', { scope: 'read:org, repo' }));

  app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
    // If not logged in at all, go there.
    if (! (req.user && req.user.profile && req.user.profile.username && req.user.accessToken)) return res.redirect('/auth/github');

    let github = new GithubAPI(req.user.profile.username, req.user.accessToken);

    github.fetchOrgs()
      .then(github.filterOrgs.bind(github))
      .then(() => {
        // Great. Got our teams
        return res.redirect('/');
      })
      .catch((err) => {
        console.error(err);
        // You're not one in these teams
        req.logout();
        res.clearCookie('accessToken');
        return res.redirect('/?unauthorized');
      });
  });
}
