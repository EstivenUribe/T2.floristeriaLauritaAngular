const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Rutas públicas
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);

// Rutas protegidas
router.get('/profile', verifyToken, authController.getProfile);

module.exports = router;