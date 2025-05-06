const Banner = require('../models/banner');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Obtener todos los banners
 * @route   GET /api/banners
 * @access  Public
 */
exports.getAllBanners = async (req, res) => {
  try {
    let query = {};
    
    // Filtrar por sección si se especifica
    if (req.query.section) {
      query.seccion = req.query.section;
    }
    
    // Filtrar solo activos si se especifica
    if (req.query.active === 'true') {
      query.activo = true;
      
      // Si queremos banners activos y vigentes
      if (req.query.current === 'true') {
        const now = new Date();
        
        query.fechaInicio = { $lte: now };
        query.$or = [
          { fechaFin: { $exists: false } },
          { fechaFin: null },
          { fechaFin: { $gt: now } }
        ];
      }
    }
    
    // Ordenar por sección y luego por orden
    const banners = await Banner.find(query).sort({ seccion: 1, orden: 1 });
    
    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener banners',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener banners activos para una sección
 * @route   GET /api/banners/section/:section
 * @access  Public
 */
exports.getActiveBannersBySection = async (req, res) => {
  try {
    const banners = await Banner.findActiveBySection(req.params.section);
    
    res.status(200).json({
      success: true,
      count: banners.length,
      data: banners
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error al obtener banners para la sección ${req.params.section}`,
      error: error.message
    });
  }
};

/**
 * @desc    Obtener un banner por ID
 * @route   GET /api/banners/:id
 * @access  Public
 */
exports.getBannerById = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: banner
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el banner',
      error: error.message
    });
  }
};

/**
 * @desc    Crear un nuevo banner
 * @route   POST /api/banners
 * @access  Private (Admin only)
 */
exports.createBanner = async (req, res) => {
  try {
    // Si se recibe un archivo de imagen, se procesa
    if (req.file) {
      req.body.imagen = req.file.filename;
    }
    
    // Crear el nuevo banner
    const newBanner = await Banner.create(req.body);
    
    res.status(201).json({
      success: true,
      data: newBanner,
      message: 'Banner creado exitosamente'
    });
  } catch (error) {
    // Si hay un error y se subió una imagen, eliminarla
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/banners', req.file.filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error al eliminar imagen:', err);
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Error al crear banner',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizar un banner
 * @route   PUT /api/banners/:id
 * @access  Private (Admin only)
 */
exports.updateBanner = async (req, res) => {
  try {
    let banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner no encontrado'
      });
    }
    
    // Si se recibe un archivo de imagen, se procesa y se borra la anterior
    if (req.file) {
      // Borrar la imagen anterior si existe
      if (banner.imagen) {
        const oldFilePath = path.join(__dirname, '../uploads/banners', banner.imagen);
        fs.unlink(oldFilePath, (err) => {
          if (err && err.code !== 'ENOENT') console.error('Error al eliminar imagen anterior:', err);
        });
      }
      
      req.body.imagen = req.file.filename;
    }
    
    // Actualizar el banner
    banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: banner,
      message: 'Banner actualizado exitosamente'
    });
  } catch (error) {
    // Si hay un error y se subió una imagen, eliminarla
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/banners', req.file.filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error al eliminar imagen:', err);
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Error al actualizar banner',
      error: error.message
    });
  }
};

/**
 * @desc    Cambiar estado (activo/inactivo) de un banner
 * @route   PATCH /api/banners/:id/toggle-status
 * @access  Private (Admin only)
 */
exports.toggleBannerStatus = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner no encontrado'
      });
    }
    
    // Cambiar el estado
    banner.activo = !banner.activo;
    await banner.save();
    
    res.status(200).json({
      success: true,
      data: banner,
      message: `Banner ${banner.activo ? 'activado' : 'desactivado'} exitosamente`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al cambiar estado del banner',
      error: error.message
    });
  }
};

/**
 * @desc    Eliminar un banner
 * @route   DELETE /api/banners/:id
 * @access  Private (Admin only)
 */
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner no encontrado'
      });
    }
    
    // Eliminar la imagen asociada si existe
    if (banner.imagen) {
      const filePath = path.join(__dirname, '../uploads/banners', banner.imagen);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') console.error('Error al eliminar imagen:', err);
      });
    }
    
    await banner.remove();
    
    res.status(200).json({
      success: true,
      message: 'Banner eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar banner',
      error: error.message
    });
  }
};

/**
 * @desc    Reordenar banners
 * @route   PUT /api/banners/reorder
 * @access  Private (Admin only)
 */
exports.reorderBanners = async (req, res) => {
  try {
    const { banners } = req.body; // Arreglo de objetos {id, orden}
    
    if (!Array.isArray(banners)) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un arreglo de banners'
      });
    }
    
    // Actualizar el orden de cada banner
    const updatePromises = banners.map(item => 
      Banner.findByIdAndUpdate(
        item.id, 
        { orden: item.orden },
        { new: true }
      )
    );
    
    await Promise.all(updatePromises);
    
    res.status(200).json({
      success: true,
      message: 'Orden de banners actualizado exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al reordenar banners',
      error: error.message
    });
  }
};