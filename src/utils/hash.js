'use strict';

const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

const hashPassword = async (plainPassword) => bcrypt.hash(plainPassword, SALT_ROUNDS);

const verifyPassword = async (plainPassword, hash) => bcrypt.compare(plainPassword, hash);

module.exports = { hashPassword, verifyPassword };
