'use strict';

/**
 * Module Dependencies
 */
import { Router } from 'jack-stack';


/**
 * Local Constants
 */
const router = Router();

export default router;

router.get('/', (req, res, next) => {
  if (typeof req.query.unauthorized !== 'undefined') {
    res.locals.unauthorized = true;
    return next();
  }

  res.locals.user = req.user;
  next();
});
