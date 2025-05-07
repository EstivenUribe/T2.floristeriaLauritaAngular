const Product = require('../models/product');

// Obtener productos con paginación y filtros
exports.getAllProducts = async (req, res) => {
  try {
    // Parámetros de paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Construir filtros
    const filter = buildFilter(req.query);
    
    // Opciones de ordenación
    const sortOptions = {};
    if (req.query.sortBy) {
      sortOptions[req.query.sortBy] = req.query.sortDirection === 'desc' ? -1 : 1;
    } else {
      // Ordenación por defecto: productos destacados primero, luego por fecha de creación
      sortOptions.destacado = -1;
      sortOptions.fechaCreacion = -1;
    }
    
    // Seleccionar campos específicos si se solicitan
    const projection = req.query.fields ? req.query.fields.split(',').join(' ') : '';
    
    // Ejecutar consulta con paginación
    const [productos, total] = await Promise.all([
      Product.find(filter)
        .select(projection)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter)
    ]);
    
    // Calcular páginas totales
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      items: productos,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error en getAllProducts:', error);
    res.status(500).json({ 
      message: 'Error al obtener productos', 
      error: error.message 
    });
  }
};

// Obtener productos destacados o en oferta
exports.getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const filter = { destacado: true, disponible: true };
    
    const productos = await Product.find(filter)
      .sort({ fechaCreacion: -1 })
      .limit(limit);
    
    res.json(productos);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener productos destacados', 
      error: error.message 
    });
  }
};

// Obtener productos en versión ligera (menos campos)
exports.getLightProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Determinar qué campos incluir (mínimo necesario para listados)
    const projection = req.query.fields || 'nombre imagen precio rebaja destacado';
    
    const [productos, total] = await Promise.all([
      Product.find({ disponible: true })
        .select(projection)
        .sort({ destacado: -1, fechaCreacion: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments({ disponible: true })
    ]);
    
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      items: productos,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener productos', 
      error: error.message 
    });
  }
};

// Obtener todas las categorías distintas
exports.getCategorias = async (req, res) => {
  try {
    const categorias = await Product.getCategorias();
    res.json(categorias.filter(cat => cat)); // Filtrar valores nulos o vacíos
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener categorías', 
      error: error.message 
    });
  }
};

// Obtener un producto por ID
exports.getProductById = async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener el producto', 
      error: error.message 
    });
  }
};

// Crear un nuevo producto
exports.createProduct = async (req, res) => {
  try {
    const producto = new Product(req.body);
    const nuevoProducto = await producto.save();
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(400).json({ 
      message: 'Error al crear producto', 
      error: error.message 
    });
  }
};

// Actualizar un producto por ID
exports.updateProduct = async (req, res) => {
  try {
    const productoActualizado = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!productoActualizado) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(productoActualizado);
  } catch (error) {
    res.status(400).json({ 
      message: 'Error al actualizar producto', 
      error: error.message 
    });
  }
};

// Eliminar un producto por ID
exports.deleteProduct = async (req, res) => {
  try {
    const productoEliminado = await Product.findByIdAndDelete(req.params.id);
    if (!productoEliminado) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al eliminar producto', 
      error: error.message 
    });
  }
};

// Función para construir filtros a partir de los parámetros de la consulta
function buildFilter(queryParams) {
  const filter = {};
  
  // Filtro por disponibilidad (por defecto solo productos disponibles)
  filter.disponible = queryParams.disponible === 'false' ? false : true;
  
  // Filtro de búsqueda por texto
  if (queryParams.search) {
    // Usar índice de texto si está disponible, o buscar en nombre y descripción
    filter.$or = [
      { nombre: { $regex: queryParams.search, $options: 'i' } },
      { descripcion: { $regex: queryParams.search, $options: 'i' } },
      { categoria: { $regex: queryParams.search, $options: 'i' } }
    ];
  }
  
  // Filtro por categoría
  if (queryParams.categoria) {
    filter.categoria = queryParams.categoria;
  }
  
  // Filtro por precio mínimo
  if (queryParams.minPrice) {
    filter.precio = filter.precio || {};
    filter.precio.$gte = parseFloat(queryParams.minPrice);
  }
  
  // Filtro por precio máximo
  if (queryParams.maxPrice) {
    filter.precio = filter.precio || {};
    filter.precio.$lte = parseFloat(queryParams.maxPrice);
  }
  
  // Filtro por productos destacados
  if (queryParams.destacado !== undefined) {
    filter.destacado = queryParams.destacado === 'true';
  }
  
  // Filtro por productos en rebaja
  if (queryParams.rebaja !== undefined) {
    filter.rebaja = queryParams.rebaja === 'true';
  }
  
  // Filtro por etiquetas
  if (queryParams.tags) {
    const tags = Array.isArray(queryParams.tags) 
      ? queryParams.tags 
      : [queryParams.tags];
    filter.tags = { $in: tags };
  }
  
  return filter;
}