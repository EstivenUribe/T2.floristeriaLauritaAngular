const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');
const { protect, admin } = require('../middleware/auth');

// Ruta para subir imágenes (puede ser pública o protegida según necesidades)
router.post('/', upload.single('image'), uploadController.uploadImage);

module.exports = router;