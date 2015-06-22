'use strict';

/**
 * Module Dependencies
 */
import debugLib from 'debug';
import { Router } from 'jack-stack';

/**
 * Local Constants
 */
const debug = debugLib('xpr:auth:index');
const router = Router();

export default router;

router.get('/user', (req, res) => {
  // Continue to logging in
  if (! (req.user && req.user.profile)) return res.json({ isLoggedIn: false });

  let user = req.user.profile;
  return res.json({
    name : user.displayName,
    img : user._json.avatar_url,
    isLoggedIn: true
  });
});

router.get('/logout', (req, res) => {
  debug('Logging out');
  req.logout();
  res.clearCookie('accessToken');

  res.redirect('/');
});
