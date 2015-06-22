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

router.use('/', (req, res, next) => {
  if (req.path === '/coupling/') return next();
  if (! req.user) return res.sendStatus(401);
  next();
});
