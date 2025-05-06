const Review = require('../models/review');
const Product = require('../models/product');

// Crear una nueva reseña
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.userId; // Obtenido del middleware de autenticación

    // Verificar si el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Verificar si el usuario ya ha dejado una reseña para este producto
    const existingReview = await Review.findOne({ userId, productId });
    if (existingReview) {
      return res.status(400).json({ 
        message: 'Ya has dejado una reseña para este producto' 
      });
    }

    // Crear la nueva reseña
    const review = new Review({
      userId,
      productId,
      rating,
      comment,
      approved: false // Por defecto no está aprobada hasta que un admin la revise
    });

    // Guardar la reseña
    const savedReview = await review.save();

    res.status(201).json({
      message: 'Reseña creada correctamente. Será visible una vez aprobada por un administrador.',
      review: savedReview
    });
  } catch (error) {
    console.error('Error al crear reseña:', error);
    res.status(500).json({ 
      message: 'Error al crear la reseña',
      error: error.message 
    });
  }
};

// Obtener reseñas aprobadas por producto
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    // Obtener todas las reseñas aprobadas para el producto
    const reviews = await Review.find({ 
      productId, 
      approved: true 
    }).populate('userId', 'username'); // Incluir datos del usuario (solo username)

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ 
      message: 'Error al obtener las reseñas',
      error: error.message 
    });
  }
};

// Obtener todas las reseñas (solo para administradores)
exports.getAllReviews = async (req, res) => {
  try {
    // Obtener todas las reseñas con información de productos y usuarios
    const reviews = await Review.find()
      .populate('userId', 'username email')
      .populate('productId', 'nombre');

    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error al obtener todas las reseñas:', error);
    res.status(500).json({ 
      message: 'Error al obtener las reseñas',
      error: error.message 
    });
  }
};

// Aprobar o rechazar una reseña (solo para administradores)
exports.updateReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { approved } = req.body;

    // Actualizar el estado de aprobación
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { approved },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    res.status(200).json({
      message: `Reseña ${approved ? 'aprobada' : 'rechazada'} correctamente`,
      review
    });
  } catch (error) {
    console.error('Error al actualizar estado de reseña:', error);
    res.status(500).json({ 
      message: 'Error al actualizar el estado de la reseña',
      error: error.message 
    });
  }
};

// Eliminar una reseña
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    // Buscar la reseña
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    // Verificar que sea el autor o un administrador
    if (review.userId.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({ 
        message: 'No tienes permiso para eliminar esta reseña' 
      });
    }

    // Eliminar la reseña
    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({ message: 'Reseña eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar reseña:', error);
    res.status(500).json({ 
      message: 'Error al eliminar la reseña',
      error: error.message 
    });
  }
};