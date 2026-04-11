'use strict';

const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { getContacts, addContact } = require('../controllers/contacts.controller');

const router = Router();

const contactsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones, intenta de nuevo más tarde' },
});

router.get('/', contactsLimiter, getContacts);
router.post('/', contactsLimiter, addContact);

module.exports = router;
