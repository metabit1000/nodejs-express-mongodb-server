'use strict';

const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const { register, login } = require('../controllers/auth.controller');

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones, intenta de nuevo más tarde' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

module.exports = router;
