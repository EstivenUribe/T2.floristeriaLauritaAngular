const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Obtener el carrito del usuario
router.get('/', cartController.getCart);

// Añadir producto al carrito
router.post('/add', cartController.addToCart);

// Actualizar cantidad de un producto
router.put('/update', cartController.updateCartItem);

// Eliminar un producto del carrito
router.delete('/remove/:productId', cartController.removeFromCart);

// Vaciar el carrito
router.delete('/clear', cartController.clearCart);

module.exports = router;