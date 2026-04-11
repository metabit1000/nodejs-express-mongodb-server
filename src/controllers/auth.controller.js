'use strict';

const { getDb } = require('../config/db');
const { saltHashPassword, checkHashPassword } = require('../utils/hash');

const register = async (req, res, next) => {
  try {
    const { user, password, email } = req.body;
    if (!user || !password || !email) {
      return res.status(400).json({ error: 'user, password y email son requeridos' });
    }

    const db = await getDb();
    const exists = await db.collection('login').countDocuments({ user });
    if (exists) {
      return res.status(409).json({ error: 'User ya existe' });
    }

    const { passwordHash, salt } = saltHashPassword(password);
    await db.collection('login').insertOne({ user, password: passwordHash, salt, email });

    return res.status(201).json({ message: 'Registro correcto' });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, password } = req.body;
    if (!user || !password) {
      return res.status(400).json({ error: 'user y password son requeridos' });
    }

    const db = await getDb();
    const record = await db.collection('login').findOne({ user });
    if (!record) {
      return res.status(401).json({ error: 'La cuenta que intenta ingresar, no existe' });
    }

    const { passwordHash } = checkHashPassword(password, record.salt);
    if (passwordHash !== record.password) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    return res.status(200).json({ message: 'Login correcto' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
