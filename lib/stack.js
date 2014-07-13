(function() {
  'use strict';

  /**
   * Module Dependencies
   */
  var stack = require('simple-stack-common')
    , path = require('path')
    , glob = require('glob')
    , jade = require('jade')
    , stylus = require('stylus')
    , RedisStore = require('connect-redis')(stack.middleware.session);

  /**
   * Local Vars
   */
  var redisUrl = process.env.REDIS_URL || process.env.REDISTOGO_URL
    , headers = {
      host: 'x-orig-host',
      path: 'x-orig-path',
      port: 'x-orig-port',
      proto: 'x-orig-proto'
    }
    , app = module.exports = stack({
      base: headers
    })
    , staticDir = path.join(__dirname, '..', 'assets')
    , cookieSecret = process.env.COOKIE_SECRET || 'yeah, this should really exist'
    , sessionName = process.env.COOKIE_NAME || 'feature.id'
    , sessionSecret = process.env.SESSION_SECRET || 'whatchoo talkin about willis?';

  /**
   * Static Content
   */
  app.useAfter('expressInit', stylus.middleware(staticDir));
  app.useAfter('stylus', stack.middleware.static(staticDir));
  app.remove('emptyFavicon');

  /**
   * Session Management
   */
  app.useAfter('logger', stack.middleware.cookieParser(cookieSecret));
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

  app.restrict = function restrict(req, res, next) {
    function isAuthorized() {
      if (! (req.user && req.user.profile && req.user.profile.username)) return;
      if (! req.user.accessToken) return;
      if (! req.session.githubTeams) return;

      return true;
    }

    if (! isAuthorized()) return res.redirect('/auth/github');
    next();
  };


  glob
    .sync(path.join(__dirname, 'controllers','*'))
    // .sync(path.join(__dirname, 'controllers','**','*.js'))
    .forEach(function(file) {
      return require(file)(app);
    });

  console.log('=================== Stack =====================');
  for (var i=0, l=app.stack.length; i<l; i++) {
    console.log(i + ') ' + (app.stack[i].name || app.stack[i].handle.name));
  }
  console.log('===============================================');

})();
