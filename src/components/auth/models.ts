import mongoose = require('mongoose');

const OAuthAccessTokenModel = mongoose.model(
  'OAuthAccessToken',
  new mongoose.Schema(
    {
      user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
      client: {type: mongoose.Schema.Types.ObjectId, ref: 'OAuthClient'},
      accessToken: {type: String},
      accessTokenExpiresAt: {type: Date},
      refreshToken: {type: String},
      refreshTokenExpiresAt: {type: Date},
      scope: {type: String},
    },
    {
      timestamps: true,
    }
  ),
  'oauth_access_tokens'
);

const OAuthCodeModel = mongoose.model(
  'OAuthCode',
  new mongoose.Schema(
    {
      user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
      client: {type: mongoose.Schema.Types.ObjectId, ref: 'OAuthClient'},
      authorizationCode: {type: String},
      expiresAt: {type: Date},
      scope: {type: String},
    },
    {
      timestamps: true,
    }
  ),
  'oauth_auth_codes'
);

const OAuthClientModel = mongoose.model(
  'OAuthClient',
  new mongoose.Schema(
    {
      user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
      clientId: {type: String},
      clientSecret: {type: String},
      redirectUris: {type: Array},
      grants: {type: Array},
    },
    {
      timestamps: true,
    }
  ),
  'oauth_clients'
);

module.exports.getAccessToken = async (accessToken: any) => {
  let _accessToken: any = await OAuthAccessTokenModel.findOne({accessToken})
    .populate('user')
    .populate('client');

  if (!_accessToken) {
    return false;
  }

  _accessToken = _accessToken.toObject();

  if (!_accessToken.user) {
    _accessToken.user = {};
  }
  return _accessToken;
};

module.exports.getRefreshToken = (refreshToken: any) => {
  return OAuthAccessTokenModel.findOne({refreshToken}).populate('user').populate('client');
};

module.exports.getAuthorizationCode = (code: any) => {
  return OAuthCodeModel.findOne({authorizationCode: code}).populate('user').populate('client');
};

module.exports.getClient = async (clientId: any, clientSecret: any) => {
  const params: any = {clientId};

  if (clientSecret) {
    params.clientSecret = clientSecret;
  }
  return await OAuthClientModel.findOne(params);
};

module.exports.getUser = async (username: any, password: any) => {
  const UserModel = mongoose.model('User');
  const user: any = await UserModel.findOne({username});
  if (user.validatePassword(password)) {
    return user;
  }
  return false;
};

module.exports.getUserFromClient = (client: any) => {
  // let UserModel = mongoose.model('User');
  // return UserModel.findById(client.user);
  return {};
};

module.exports.saveToken = async (token: any, client: any, user: any) => {
  const accessToken: any = (
    await OAuthAccessTokenModel.create({
      user: user.id || null,
      client: client.id,
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      refreshToken: token.refreshToken,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt,
      scope: token.scope,
    })
  ).toObject();

  if (!accessToken.user) {
    accessToken.user = {};
  }

  return accessToken;
};

module.exports.saveAuthorizationCode = (code: any, client: any, user: any) => {
  const authCode = new OAuthCodeModel({
    user: user.id,
    client: client.id,
    authorizationCode: code.authorizationCode,
    expiresAt: code.expiresAt,
    scope: code.scope,
  });
  return authCode.save();
};

module.exports.revokeToken = async (accessToken: any) => {
  const result = await OAuthAccessTokenModel.deleteOne({
    refreshToken: accessToken.refreshToken,
  });
  return result.deletedCount > 0;
};

module.exports.revokeAuthorizationCode = async (code: any) => {
  const result = await OAuthCodeModel.deleteOne({
    authorizationCode: code.authorizationCode,
  });
  return result.deletedCount > 0;
};
