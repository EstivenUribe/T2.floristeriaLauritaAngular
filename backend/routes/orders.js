const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, isAdmin } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');

// Rutas protegidas - requieren autenticación
router.use(protect);

// Rutas de órdenes para usuarios
router.route('/')
  .post(csrfProtection, orderController.createOrder);

router.route('/me')
  .get(orderController.getUserOrders);

router.route('/:id')
  .get(orderController.getOrderById);

router.route('/:id/pay')
  .put(csrfProtection, orderController.updateOrderToPaid);

// Rutas de órdenes solo para administradores
router.route('/')
  .get(isAdmin, orderController.getOrders);

router.route('/:id/deliver')
  .put(isAdmin, csrfProtection, orderController.updateOrderToDelivered);

router.route('/:id/status')
  .put(isAdmin, csrfProtection, orderController.updateOrderStatus);

module.exports = router;
