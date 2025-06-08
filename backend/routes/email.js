/**
 * Rutas para el manejo de emails
 */
const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');

// Ruta para enviar mensaje de contacto y confirmación
router.post('/contact', emailController.sendContactConfirmation);

module.exports = router;
