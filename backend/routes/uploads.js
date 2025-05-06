const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');
const { verifyAdmin } = require('../middleware/auth');

// Ruta para subir imágenes (solo admin)
router.post('/', verifyAdmin, upload.single('image'), uploadController.uploadImage);

module.exports = router;