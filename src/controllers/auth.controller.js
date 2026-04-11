'use strict';

const { getDb } = require('../config/db');
const { hashPassword, verifyPassword } = require('../utils/hash');

const register = async (req, res, next) => {
  try {
    const { user, password, email } = req.body;
    if (typeof user !== 'string' || typeof password !== 'string' || typeof email !== 'string') {
      return res.status(400).json({ error: 'user, password y email son requeridos y deben ser texto' });
    }

    const db = await getDb();
    const exists = await db.collection('login').countDocuments({ user: { $eq: user } });
    if (exists) {
      return res.status(409).json({ error: 'User ya existe' });
    }

    const passwordHash = await hashPassword(password);
    await db.collection('login').insertOne({ user, password: passwordHash, email });

    return res.status(201).json({ message: 'Registro correcto' });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, password } = req.body;
    if (typeof user !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'user y password son requeridos y deben ser texto' });
    }

    const db = await getDb();
    const record = await db.collection('login').findOne({ user: { $eq: user } });
    if (!record) {
      return res.status(401).json({ error: 'La cuenta que intenta ingresar, no existe' });
    }

    const valid = await verifyPassword(password, record.password);
    if (!valid) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    return res.status(200).json({ message: 'Login correcto' });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };
