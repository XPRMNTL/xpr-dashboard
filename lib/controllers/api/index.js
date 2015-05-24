'use strict';

const ROOT = '/api';
const routes = [ 'app', 'github', 'coupling', 'experiment', ];

export default function(app) {

  app.useBefore('router', ROOT, 'authCheck', (req, res, next) => {
    if (req.path === '/coupling/') return next();
    if (! req.user) return res.send(401);
    next();
  });


  routes.map((route) => {
    require('./' + route)(app, ROOT + '/' + route);
  });

};
