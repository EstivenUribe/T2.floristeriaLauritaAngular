const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Configurar multer para subir imágenes de banners
const bannerUpload = upload.single('imagen');

// Rutas públicas - Accesibles sin autenticación
router.get('/', bannerController.getAllBanners);
router.get('/section/:section', bannerController.getActiveBannersBySection);
router.get('/:id', bannerController.getBannerById);

// Rutas privadas - Solo para administradores
router.post('/', protect, admin, bannerUpload, bannerController.createBanner);
router.put('/:id', protect, admin, bannerUpload, bannerController.updateBanner);
router.patch('/:id/toggle-status', protect, admin, bannerController.toggleBannerStatus);
router.delete('/:id', protect, admin, bannerController.deleteBanner);
router.put('/reorder', protect, admin, bannerController.reorderBanners);

module.exports = router;