const express = require('express');
const router = express.Router();
const { generateCSRFToken } = require('../middleware/csrf');

// Endpoint para obtener un token CSRF
router.get('/token', (req, res) => {
  const token = generateCSRFToken(req);
  
  // Enviar token como cookie con atributos de seguridad
  res.cookie('csrfToken', token, {
    httpOnly: false, // Debe ser accesible desde JavaScript
    secure: process.env.NODE_ENV === 'production', // HTTPS en producción
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  });
  
  res.status(200).json({ csrfToken: token });
});

module.exports = router;
