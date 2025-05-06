// Controller para manejar subida de imágenes
exports.uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No se ha subido ninguna imagen' 
      });
    }

    // Determinar la carpeta para la URL según el parámetro folder
    let folder = 'products'; // Por defecto es 'products'
    if (req.body && req.body.folder) {
      folder = req.body.folder; // Puede ser 'team', 'banners', etc.
    }
    
    // Crear la URL para la imagen
    const imagePath = `/uploads/${folder}/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      message: 'Imagen subida exitosamente',
      imagePath: imagePath,
      filename: req.file.filename,
      folder: folder
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir la imagen',
      error: error.message
    });
  }
};