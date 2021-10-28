import OAuthServer = require('express-oauth-server');
import mongoose = require('mongoose');
import crypto = require('crypto');

const router = require('express').Router();
const OAuthModel: any = require('../auth/models');

const oauth = new OAuthServer({
  model: OAuthModel,
  useErrorHandler: true,
});

router.use('/account', oauth.authenticate(), (req: any, res: any) => {
  return res.json(res.locals.oauth.token.user);
});
router.use('/secured/profile', oauth.authenticate(), (req: any, res: any) => {
  return res.render('secured', {layout: 'layout', token: JSON.stringify(res.locals)});
});

router.get('/', (req: any, res: any, next: any) => {
  res.render('index', {
    layout: 'layout',
    title: 'Node Express Example',
  });
});
router.get('/register', (req: any, res: any, next: any) => {
  res.render('register', {layout: 'layout', message: req.flash('message')});
});

router.post('/register', async (req: any, res: any, next: any) => {
  if (req.body.password !== req.body.confirmPassword) {
    return res.send('Passwords does not match', 422);
  }

  const UserModel = mongoose.model('User');
  const OAuthClientModel = mongoose.model('OAuthClient');

  // Create User
  const _user: any = new UserModel({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username,
    email: req.body.email,
    verificationCode: crypto.randomBytes(16).toString('hex'),
  });
  _user.setPassword(req.body.password);
  let user = null;
  try {
    user = await _user.save();
  } catch (error) {
    return res.send(error.errmsg, 422);
  }

  if (!user) {
    return res.send('Error creating user', 422);
  }

  // Create OAuth Client
  let _client = await OAuthModel.getClient(req.body.clientId, req.body.clientSecret);

  if (!_client) {
    _client = new OAuthClientModel({
      user: user.id,
      clientId: req.body.clientId,
      clientSecret: req.body.clientSecret,
      redirectUris: req.body.redirectUris.split(','),
      grants: ['authorization_code', 'client_credentials', 'refresh_token', 'password'],
    });
    _client.save();
  }

  req.flash('message', 'Registration successful!');

  return res.redirect('/register');
});

export default router;
