const Order = require('../models/order');
const { verifyCSRFToken } = require('../middleware/csrf');

// Crear nuevo pedido
exports.createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice
    } = req.body;

    // Verificar que hay items en el pedido
    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No hay productos en el pedido' });
    }

    // Crear el nuevo pedido
    const order = new Order({
      user: req.user.id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice
    });

    // Guardar en la base de datos
    const createdOrder = await order.save();

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el pedido', error: error.message });
  }
};

// Obtener todos los pedidos del usuario actual
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 }) // Ordenar por fecha, más reciente primero
      .populate('user', 'name email'); // Poblar info básica del usuario

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los pedidos', error: error.message });
  }
};

// Obtener un pedido específico por ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate({
        path: 'orderItems.product',
        select: 'name image' // Solo traer nombre e imagen del producto
      });

    // Verificar si el pedido existe
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Verificar que el pedido pertenece al usuario actual o es admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado para ver este pedido' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el pedido', error: error.message });
  }
};

// Actualizar el estado de un pedido a pagado
exports.updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Actualizar el estado de pago
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address
    };

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el estado de pago', error: error.message });
  }
};

// Actualizar el estado de un pedido a entregado
exports.updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Verificar que el usuario es admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado para actualizar este pedido' });
    }

    // Actualizar el estado de entrega
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'entregado';
    if (req.body.trackingNumber) {
      order.trackingNumber = req.body.trackingNumber;
    }

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el estado de entrega', error: error.message });
  }
};

// Actualizar el estado de un pedido
exports.updateOrderStatus = async (req, res) => {
  try {
    // Log para debugging
    console.log('Actualizando estado de pedido:', {
      orderId: req.params.id,
      requestBody: req.body,
      user: { id: req.user.id, role: req.user.role }
    });

    // Validar el ID del pedido
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('ID de pedido inválido:', req.params.id);
      return res.status(400).json({ message: 'ID de pedido inválido' });
    }

    const { status, notes, trackingNumber } = req.body;

    // Validar el estado
    const estadosValidos = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];
    if (status && !estadosValidos.includes(status)) {
      console.log('Estado inválido:', status);
      return res.status(400).json({ 
        message: 'Estado inválido', 
        estadosPermitidos: estadosValidos 
      });
    }

    // Buscar el pedido
    const order = await Order.findById(req.params.id);

    if (!order) {
      console.log('Pedido no encontrado con ID:', req.params.id);
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Verificar que el usuario es admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado para actualizar este pedido' });
    }

    // Actualizar el estado
    if (status) {
      console.log(`Cambiando estado de '${order.status}' a '${status}'`);
      order.status = status;
      
      // Si el estado es entregado, actualizar también isDelivered
      if (status === 'entregado' && !order.isDelivered) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }
      
      // Si el estado es cancelado, no puede estar pagado o entregado
      if (status === 'cancelado') {
        order.isDelivered = false;
        order.deliveredAt = undefined;
      }
    }

    // Actualizar notas si se proporcionan
    if (notes) {
      order.notes = notes;
    }

    // Actualizar número de seguimiento si se proporciona
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    try {
      const updatedOrder = await order.save();
      console.log('Pedido actualizado correctamente:', updatedOrder._id);
      res.status(200).json(updatedOrder);
    } catch (saveError) {
      console.error('Error al guardar el pedido:', saveError);
      return res.status(400).json({ 
        message: 'Error de validación al guardar el pedido', 
        detalles: saveError.message,
        errores: saveError.errors ? Object.keys(saveError.errors).map(key => ({
          campo: key,
          mensaje: saveError.errors[key].message
        })) : undefined
      });
    }
  } catch (error) {
    console.error('Error general al actualizar estado del pedido:', error);
    res.status(500).json({ 
      message: 'Error al actualizar el estado del pedido', 
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
};

// Obtener todos los pedidos (solo admin)
exports.getOrders = async (req, res) => {
  try {
    // Verificar que el usuario es admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado para ver todos los pedidos' });
    }
    
    const orders = await Order.find({})
      .populate('user', 'id name email')
      .sort({ createdAt: -1 });
      
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los pedidos', error: error.message });
  }
};
