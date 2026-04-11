'use strict';

const { getDb } = require('../config/db');

const getContacts = async (req, res, next) => {
  try {
    const { user } = req.query;
    if (!user) {
      return res.status(400).json({ error: 'El parámetro user es requerido' });
    }

    const db = await getDb();
    const contacts = await db.collection('contactos').find({ user }).toArray();

    if (!contacts.length) {
      return res.status(404).json({ message: 'No hay contactos' });
    }

    return res.status(200).json(contacts);
  } catch (err) {
    next(err);
  }
};

const addContact = async (req, res, next) => {
  try {
    const { user, telf } = req.body;
    if (!user || !telf) {
      return res.status(400).json({ error: 'user y telf son requeridos' });
    }

    const db = await getDb();
    const exists = await db.collection('contactos').countDocuments({ user });

    if (exists) {
      await db.collection('contactos').updateOne({ user }, { $set: { telf } });
      return res.status(200).json({ message: 'Contacto modificado correctamente' });
    }

    await db.collection('contactos').insertOne({ user, telf });
    return res.status(201).json({ message: 'Contacto registrado correctamente' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getContacts, addContact };
