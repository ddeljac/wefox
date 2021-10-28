import mongoose = require('mongoose');
import crypto = require('crypto');

const UserSchema = new mongoose.Schema(
  {
    firstName: {type: String},
    lastName: {type: String},
    username: {type: String, unique: true},
    password: {type: String},
    email: {type: String, unique: true},
    verificationCode: {type: String},
    verifiedAt: {type: Date},
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.validatePassword = (password) => {
  let _password = crypto.pbkdf2Sync(password, 'salt', 10000, 32, 'sha512').toString('hex'); // TODO salt in config
  // @ts-ignore
  return this.password === _password;
};

UserSchema.methods.setPassword = (password) => {
  // @ts-ignore
  this.password = crypto.pbkdf2Sync(password, 'salt', 10000, 32, 'sha512').toString('hex'); // TODO salt in config
  // @ts-ignore
  this.password = password;
};

mongoose.model('User', UserSchema, 'users');
