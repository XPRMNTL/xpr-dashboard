'use strict';

/**
 * Module Dependencies
 */
import { app as AppModel } from 'xpr-dash-mongodb';

export default function(app, base) {

  base = base || '/';

  app.put(route('/:experimentId'), (req, res, next) => {
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
  });

  app.delete(route('/:experimentId'), (req, res, next) => {
    let id = req.params.experimentId;

    AppModel.deleteExperiment(id)
      .then((app) => {
        res.send(204);
        process.nextTick(app.serialize.bind(app));
      })
      .catch(next);
  });

  function route(path) {
    return base + (path || '');
  }
}
