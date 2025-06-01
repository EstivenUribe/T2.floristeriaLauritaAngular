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

// Ruta para actualizar perfil - añadida la ruta PUT que coincide con la petición del frontend
// Opción 1: Con CSRF Protection (recomendado para producción)
router.put('/profile', [verifyToken, csrfProtection], authController.updateProfile);

// Opción 2: Sin CSRF Protection (para propósitos de depuración) - Comentado por defecto
// router.put('/profile', verifyToken, authController.updateProfile);

// Mantenemos las rutas anteriores por compatibilidad
router.post('/update-profile', [verifyToken, csrfProtection], authController.updateProfile);

router.post('/change-password', [verifyToken, csrfProtection], (req, res) => {
  // Placeholder para cambio de contraseña
  res.status(200).json({ message: 'Contraseña actualizada correctamente' });
});

module.exports = router;