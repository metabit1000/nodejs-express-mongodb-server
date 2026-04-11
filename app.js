'use strict';

require('dotenv').config();

const express = require('express');
const errorHandler = require('./src/middleware/errorHandler');
const authRoutes = require('./src/routes/auth.routes');
const contactsRoutes = require('./src/routes/contacts.routes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/contacts', contactsRoutes);

app.use(errorHandler);

module.exports = app;
