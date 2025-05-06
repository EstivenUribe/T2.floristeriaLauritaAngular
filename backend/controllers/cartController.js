const Cart = require('../models/cart');
const Product = require('../models/product');

// Obtener el carrito del usuario
exports.getCart = async (req, res) => {
  try {
    const userId = req.userId;

    // Buscar el carrito del usuario
    let cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      select: 'nombre imagen precio' // Solo seleccionar los campos necesarios
    });

    // Si no existe, crear uno nuevo
    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }

    // Calcular el total
    const total = cart.calculateTotal();

    res.status(200).json({
      items: cart.items,
      total
    });
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).json({ 
      message: 'Error al obtener el carrito',
      error: error.message 
    });
  }
};

// Añadir producto al carrito
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.userId;
    
    // Validar cantidad
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'La cantidad debe ser al menos 1' });
    }

    // Verificar si el producto existe y obtener su precio
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Buscar el carrito del usuario o crear uno nuevo
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Verificar si el producto ya está en el carrito
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      // Actualizar cantidad si ya existe
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Añadir nuevo item al carrito
      cart.items.push({
        productId,
        quantity,
        price: product.precio
      });
    }

    // Actualizar fecha de modificación
    cart.updatedAt = Date.now();
    
    // Guardar carrito
    await cart.save();

    // Calcular el total
    const total = cart.calculateTotal();

    res.status(200).json({
      message: 'Producto añadido al carrito correctamente',
      items: cart.items,
      total
    });
  } catch (error) {
    console.error('Error al añadir al carrito:', error);
    res.status(500).json({ 
      message: 'Error al añadir producto al carrito',
      error: error.message 
    });
  }
};

// Actualizar cantidad de un producto en el carrito
exports.updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.userId;

    // Validar cantidad
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'La cantidad debe ser al menos 1' });
    }

    // Buscar el carrito
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    // Encontrar el ítem en el carrito
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Producto no encontrado en el carrito' });
    }

    // Actualizar cantidad
    cart.items[itemIndex].quantity = quantity;
    cart.updatedAt = Date.now();
    
    // Guardar cambios
    await cart.save();

    // Calcular el total
    const total = cart.calculateTotal();

    res.status(200).json({
      message: 'Carrito actualizado correctamente',
      items: cart.items,
      total
    });
  } catch (error) {
    console.error('Error al actualizar carrito:', error);
    res.status(500).json({ 
      message: 'Error al actualizar producto en el carrito',
      error: error.message 
    });
  }
};

// Eliminar un producto del carrito
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.userId;

    // Buscar el carrito
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    // Filtrar el ítem del carrito
    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );
    
    cart.updatedAt = Date.now();
    
    // Guardar cambios
    await cart.save();

    // Calcular el total
    const total = cart.calculateTotal();

    res.status(200).json({
      message: 'Producto eliminado del carrito correctamente',
      items: cart.items,
      total
    });
  } catch (error) {
    console.error('Error al eliminar del carrito:', error);
    res.status(500).json({ 
      message: 'Error al eliminar producto del carrito',
      error: error.message 
    });
  }
};

// Vaciar el carrito
exports.clearCart = async (req, res) => {
  try {
    const userId = req.userId;

    // Buscar y actualizar el carrito
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { items: [], updatedAt: Date.now() },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    res.status(200).json({
      message: 'Carrito vaciado correctamente',
      items: [],
      total: 0
    });
  } catch (error) {
    console.error('Error al vaciar carrito:', error);
    res.status(500).json({ 
      message: 'Error al vaciar el carrito',
      error: error.message 
    });
  }
};