import OAuthServer = require('express-oauth-server');
import mongoose = require('mongoose');

const OAuthModel: any = require('../auth/models');
const router = require('express').Router();

const oauth = new OAuthServer({
  model: OAuthModel,
  useErrorHandler: true,
});

router.post(
  '/oauth/access_token',
  oauth.token({
    requireClientAuthentication: {
      authorization_code: false,
      refresh_token: false,
    },
    accessTokenLifetime: 36000,
    refreshTokenLifetime: 36000,
  })
);

router.get('/oauth/authenticate', async (req: any, res: any, next: any) => {
  return res.render('authenticate', {layout: 'layout'});
});

router.post(
  '/oauth/authenticate',
  async (req: any, res: any, next: any) => {
    const UserModel = mongoose.model('User');
    req.body.user = await UserModel.findOne({username: req.body.username});

    return next();
  },
  oauth.authorize({
    authenticateHandler: {
      handle: (req: any) => {
        return req.body.user;
      },
    },
  })
);

export default router;
