'use strict';

/**
 * Module Dependencies
 */
import { app as AppModel } from 'xpr-dash-mongodb';


export default function(app, base) {

  base = base || '/';

  app.get(route('/'), (req, res, next) => {
    let query = AppModel.cleanQuery(req.query);

    return AppModel.find(query, true)
      .then(res.send.bind(res))
      .catch(next);
  });

  app.post(route('/'), (req, res, next) => {
    let config = cleanFields(req.body)
      , app = new AppModel(config);

    app.save()
      .then(() => {
        res.send(201, app.getDoc());
        process.nextTick(app.serialize.bind(app));
      })
      .catch((err) => {
        // 11000 means a unique index failed
        if (err.code === 11000) return res.send(409, err);
        return next(err);
      });
  });

  app.put(route('/:appId'), (req, res, next) => {
    let appId = req.params.appId
      , appData = req.body
      , name = appData.name;

    AppModel.findAndUpdate(appId, { name: name })
      .then((app) => {
        res.json(app.getDoc());
        process.nextTick(app.serialize.bind(app));
      })
      .catch((err) => {
        if (err === 404) return res.send(404);

        next(err);
      });

  });

  app.put(route('/:appId/groups'), (req, res, next) => {
    let appId = req.params.appId
      , groups = req.body;

    AppModel.findAndUpdate(appId, { groups: groups })
      .then((app) => {
        res.json(app.getDoc());
        process.nextTick(app.serialize.bind(app));
      })
      .catch(next);
  });


  function route(path) {
    return base + (path || '');
  }
}

function cleanFields(oldObj) {
  let fieldList = [ 'github_repo' ]
    , newObj = {}
    , field;

  for (let i=0, l=fieldList.length; i<l; i++) {
    field = fieldList[i];
    if (oldObj[field]) newObj[field] = oldObj[field];
  }

  return newObj;
}
