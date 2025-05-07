const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, csrfProtection } = require('../middleware/auth');

// Rutas públicas
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/refresh-token', authController.refreshToken);
router.post('/signout', authController.signout);
router.get('/csrf-token', authController.getCsrfToken);

// Rutas protegidas
router.get('/profile', verifyToken, authController.getProfile);
router.get('/verify', verifyToken, authController.verifyToken);

// Rutas protegidas con CSRF
router.post('/update-profile', [verifyToken, csrfProtection], (req, res) => {
  // Placeholder para actualización de perfil de usuario
  res.status(200).json({ message: 'Perfil actualizado correctamente' });
});

router.post('/change-password', [verifyToken, csrfProtection], (req, res) => {
  // Placeholder para cambio de contraseña
  res.status(200).json({ message: 'Contraseña actualizada correctamente' });
});

module.exports = router;