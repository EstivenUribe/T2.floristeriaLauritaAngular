const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Obtener reseñas por producto (públicas - solo las aprobadas)
router.get('/product/:productId', reviewController.getProductReviews);

// Rutas protegidas (requieren autenticación)
router.post('/', verifyToken, reviewController.createReview);
router.delete('/:reviewId', verifyToken, reviewController.deleteReview);

// Rutas solo para administradores
router.get('/', verifyAdmin, reviewController.getAllReviews);
router.patch('/:reviewId/status', verifyAdmin, reviewController.updateReviewStatus);

// NUEVA RUTA para obtener todos los comentarios aprobados (para la página "Nosotros")
router.get('/featured', reviewController.getFeaturedReviews); // Es pública

module.exports = router;