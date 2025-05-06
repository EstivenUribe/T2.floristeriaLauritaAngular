// Controller para manejar subida de imágenes
exports.uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No se ha subido ninguna imagen' 
      });
    }

    // Crear la URL para la imagen
    const imagePath = `/uploads/${req.file.filename}`;
    
    res.status(200).json({
      message: 'Imagen subida exitosamente',
      imagePath: imagePath
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al subir la imagen',
      error: error.message
    });
  }
};