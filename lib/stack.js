'use strict';


/**
 * Module Dependencies
 */
import stack from 'simple-stack-common';
import path from 'path';
import glob from 'glob';
import jade from 'jade';
import stylus from 'stylus';
import connectRedis from 'connect-redis';
import initDebug from 'debug';


/**
 * Local Vars
 */
const RedisStore = connectRedis(stack.middleware.session);
const debug = initDebug('xpr:stack');
const redisUrl = process.env.REDIS_URL || process.env.REDISTOGO_URL;
const staticDir = path.join(__dirname, '..', 'assets');
const cookieSecret = process.env.COOKIE_SECRET || 'yeah, this should really exist';
const sessionName = process.env.COOKIE_NAME || 'xprDash.id';
const sessionSecret = process.env.SESSION_SECRET || 'whatchoo talkin about willis?';
const app = stack({
  base: {
    host: 'x-orig-host',
    path: 'x-orig-path',
    port: 'x-orig-port',
    proto: 'x-orig-proto'
  }
});


/**
 * Export the App
 */
export default app;


/**
 * Static Content
 */
app.useAfter('expressInit', stylus.middleware(staticDir));
app.useAfter('stylus', stack.middleware.static(staticDir));
app.remove('emptyFavicon');


/**
 * Session Management
 */
app.useAfter('base', stack.middleware.cookieParser(cookieSecret));
app.useAfter('cookieParser', stack.middleware.session({
  key : sessionName,
  secret : sessionSecret,
  store : new RedisStore({
    url : redisUrl
  })
}));


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


glob
  .sync(path.join(__dirname, 'controllers','*'))
  // .sync(path.join(__dirname, 'controllers','**','*.js'))
  .forEach((file) => {
    return require(file)(app);
  });

debug('=================== Stack =====================');
for (var i=0, l=app.stack.length; i<l; i++) {
  debug(i + ') ' + (app.stack[i].name || app.stack[i].handle.name));
}
debug('===============================================');
