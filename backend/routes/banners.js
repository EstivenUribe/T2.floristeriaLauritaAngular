const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { verifyToken, isAdmin, verifyAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Configurar multer para subir imágenes de banners
const bannerUpload = upload.single('imagen');

// Rutas públicas - Accesibles sin autenticación
router.get('/', bannerController.getAllBanners);
router.get('/section/:section', bannerController.getActiveBannersBySection);
router.get('/:id', bannerController.getBannerById);

// Rutas privadas - Solo para administradores
router.post('/', verifyAdmin, bannerUpload, bannerController.createBanner);
router.put('/:id', verifyAdmin, bannerUpload, bannerController.updateBanner);
router.patch('/:id/toggle-status', verifyAdmin, bannerController.toggleBannerStatus);
router.delete('/:id', verifyAdmin, bannerController.deleteBanner);
router.put('/reorder', verifyAdmin, bannerController.reorderBanners);

module.exports = router;