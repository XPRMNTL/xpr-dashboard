
'use strict';

/**
 * Local Dependencies
 */
import './config';
import GithubAPI from './utils/githubAPI';

/**
 * Module Dependencies
 */
import jack, { app, init, start } from 'jack-stack';
import jackRedis from 'jack-stack-redis';
import jackStylus from 'jack-stack-stylus';
import jade from 'jade';
import passport from 'passport';
import path from 'path';
import { connect as redisUrl } from 'redis-url';

export default app;

/**
 * Local Vars
 */
const port = process.env.PORT || 5000;
const authGithubOrgs = process.env.GITHUB_ORGS.split(',').map((item) => {
  return item.toLowerCase();
});

GithubAPI.prototype.orgs = authGithubOrgs;


/**
 * Set up Jack-Stack to use RediStore
 */
jack.use(jackRedis({
  client: redisUrl(process.env.REDIS_URL || process.env.REDISTOGO_URL)
}));
jack.use(jackStylus());

/**
 * During configuration, set up the Session, Cookie, Paths, etc
 */
app.on('config', (config) => {
  config.cookie.secret = process.env.COOKIE_SECRET || 'yeah, this should really exist';
  config.session.name = process.env.COOKIE_NAME || 'xprDash.id';
  config.session.secret = process.env.SESSION_SECRET || 'whatchoo talkin about willis?';

  config.dirnames.static = path.join(__dirname, '..', 'assets');
  config.dirnames.routes = path.join(__dirname, 'routes');
  config.port = port;
});

/**
 * Setup Views
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.engine('jade', jade.__express);
app.set('baseUrl', process.env.BASE_URL);


app.restrict = (req, res, next) => {
  let isAuthorized = () => {
    if (! (req.user && req.user.profile && req.user.profile.username)) return;
    if (! req.user.accessToken) return;
    if (! req.session.githubTeams) return;

    return true;
  };

  if (! isAuthorized()) return res.redirect('/auth/github');
  next();
};

app.on('after.init.session', () => {
  app.use(passport.initialize());
  app.use(passport.session());
});

app.on('before.init.routing', () => {
  // Initialize Github Repo
  app.use((req, res, next) => {
    if (! (req.user && req.user.profile)) return next();
    req.github = new GithubAPI(req.user.profile.username, req.user.accessToken);
    next();
  });
});

app.on('after.init.routing', () => {
  const orgs = process.env.GITHUB_ORGS;
  const loginOrgs = orgs.split(',');

  app.use('/', (req, res, next) => {
    // If this is an API call, next() it
    if (req.headers.accept.indexOf('application/json') === 0) return next();

    res.locals.baseUrl = app.get('baseUrl');

    if (! req.user) return res.render('login', { orgs: loginOrgs.join(', ')});

    return res.render('ngApp');
  });

});

start(() => {
  console.info('App is a-listenin\'');
});

