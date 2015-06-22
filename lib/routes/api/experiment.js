'use strict';

/**
 * Module Dependencies
 */
import { app as AppModel } from '../../config';
import { Router } from 'jack-stack';


/**
 * Local Constants
 */
const router = Router();

export default router;


router.route('/:experimentId')
  .put((req, res, next) => {
    let id = req.params.experimentId;
    let data = req.body;

    AppModel.updateExperiment(id, {
        'experiments.$.value': data.value,
        'experiments.$.references': data.references,
        'experiments.$.date_modified': new Date(),
      })
      .then((app) => {
        res.send(app.getExperiment(id));
        process.nextTick(app.serialize.bind(app));
      })
      .catch((err) => {
        if (err instanceof Error) return next(err);

        return res.send(err);
      });
  })
  .delete((req, res, next) => {
    let id = req.params.experimentId;

    AppModel.deleteExperiment(id)
      .then((app) => {
        res.sendStatus(204);
        process.nextTick(app.serialize.bind(app));
      })
      .catch(next);
  });
