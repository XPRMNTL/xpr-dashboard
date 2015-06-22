'use strict';

/**
 * Module Dependencies
 */
import { app as AppModel } from '../../config';
import debugLib from 'debug';
import { Router } from 'jack-stack';


/**
 * Local Constants
 */
const debug = debugLib('xpr:api:app');
const router = Router();

export default router;

router.get('/', (req, res, next) => {
  let query = AppModel.cleanQuery(req.query);

  return AppModel.find(query, true)
    .then(res.send.bind(res))
    .catch(next);
});

router.post('/', (req, res, next) => {
  let config = cleanFields(req.body)
    , app = new AppModel(config);

  app.save()
    .then(() => {
      res.status(201).send(app.getDoc());
      process.nextTick(app.serialize.bind(app));
    })
    .catch((err) => {
      // 11000 means a unique index failed
      if (err.code === 11000) return res.status(409).send(err);
      return next(err);
    });
});

router.put('/:appId', (req, res, next) => {
  let appId = req.params.appId
    , appData = req.body
    , name = appData.name;

  AppModel.findAndUpdate(appId, { name: name })
    .then((app) => {
      res.json(app.getDoc());
      process.nextTick(app.serialize.bind(app));
    })
    .catch((err) => {
      if (err === 404) return res.sendStatus(404);

      next(err);
    });

});

router.put('/:appId/groups', (req, res, next) => {
  let appId = req.params.appId
    , groups = req.body;

  AppModel.findAndUpdate(appId, { groups: groups })
    .then((app) => {
      res.json(app.getDoc());
      process.nextTick(app.serialize.bind(app));
    })
    .catch(next);
});

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
