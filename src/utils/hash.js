'use strict';

const crypto = require('crypto');

const genRandomString = (length) =>
  crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);

const sha512 = (password, salt) => {
  const hash = crypto.createHmac('sha512', salt);
  hash.update(password);
  return { salt, passwordHash: hash.digest('hex') };
};

const saltHashPassword = (userPassword) => {
  const salt = genRandomString(16);
  return sha512(userPassword, salt);
};

const checkHashPassword = (userPassword, salt) => sha512(userPassword, salt);

module.exports = { saltHashPassword, checkHashPassword };
