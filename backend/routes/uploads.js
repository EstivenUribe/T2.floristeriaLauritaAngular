const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');
const { protect, admin, verifyAdmin } = require('../middleware/auth');

// Ruta para subir imágenes (solo admin)
router.post('/', verifyAdmin, upload.single('image'), uploadController.uploadImage);

// Rutas adicionales para gestión de imágenes
router.get('/:folder/:filename', uploadController.getImageInfo);
router.delete('/:folder/:filename', verifyAdmin, uploadController.deleteImage);

module.exports = router;