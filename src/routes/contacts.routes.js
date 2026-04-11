'use strict';

const { Router } = require('express');
const { getContacts, addContact } = require('../controllers/contacts.controller');

const router = Router();

router.get('/', getContacts);
router.post('/', addContact);

module.exports = router;
