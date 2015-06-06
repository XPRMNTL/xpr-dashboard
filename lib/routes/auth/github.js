'use strict';

/**
 * Module Dependencies
 */
import passport from 'passport';
import { Strategy as GithubStrategy } from 'passport-github';
import { Router } from 'jack-stack';

/**
 * Local dependencies
 */
import GithubAPI from '../../utils/githubAPI';

/**
 * Local Constants
 */
const router = Router();
const githubConfig = {
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackUrl: '/auth/github/callback',
};

export default router;

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

if (process.env.NODE_ENV !== 'test') {
  passport.use('github', new GithubStrategy(githubConfig, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => {
      return done(null, {
        'accessToken': accessToken,
        'refreshToken': refreshToken,
        'profile': profile
      });
    });
  }));
}

router.get('/', passport.authenticate('github', { scope: 'read:org, repo' }));

router.use('/', (req, res, next) => {
  next();
});

router.get('/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
  // If not logged in at all, go there.
  if (! (req.user && req.user.profile && req.user.profile.username && req.user.accessToken)) return res.redirect('./');

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
