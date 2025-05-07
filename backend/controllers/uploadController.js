const path = require('path');
const fs = require('fs');

// Controller para manejar subida de imágenes
exports.uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No se ha subido ninguna imagen' 
      });
    }

    // Usar la ruta relativa a assets que configuramos en el middleware
    const imagePath = req.uploadedFilePath;
    
    // Copiar el archivo también a la carpeta de uploads para compatibilidad
    // (esta parte es opcional pero ayuda con la retrocompatibilidad)
    const sourceFile = req.file.path;
    
    // Responder con la información de la imagen
    res.status(200).json({
      success: true,
      message: 'Imagen subida exitosamente',
      imagePath: imagePath,
      filename: req.uploadedFileName,
      folder: req.uploadFolderType,
      size: req.file.size,
      mimetype: req.file.mimetype,
      originalName: req.file.originalname
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

// Obtener información de una imagen
exports.getImageInfo = (req, res) => {
  try {
    const { folder, filename } = req.params;
    
    // Construir la ruta de la imagen
    const imagePath = `/assets/images/${folder}/${filename}`;
    
    // Verificar si el archivo existe físicamente
    const fullPath = path.join(
      __dirname, 
      `../../angular-frontend/src/assets/images/${folder}/${filename}`
    );
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }
    
    // Obtener información del archivo
    const stats = fs.statSync(fullPath);
    const fileInfo = {
      name: filename,
      path: imagePath,
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime
    };
    
    res.status(200).json({
      success: true,
      image: fileInfo
    });
  } catch (error) {
    console.error('Error al obtener información de la imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información de la imagen',
      error: error.message
    });
  }
};

// Eliminar una imagen
exports.deleteImage = (req, res) => {
  try {
    const { folder, filename } = req.params;
    
    // Construir la ruta completa de la imagen
    const fullPath = path.join(
      __dirname, 
      `../../angular-frontend/src/assets/images/${folder}/${filename}`
    );
    
    // Verificar si el archivo existe
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }
    
    // Eliminar el archivo
    fs.unlinkSync(fullPath);
    
    // También eliminar de la carpeta de uploads si existe (retrocompatibilidad)
    const backupPath = path.join(__dirname, `../uploads/${folder}/${filename}`);
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
    }
    
    res.status(200).json({
      success: true,
      message: 'Imagen eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la imagen',
      error: error.message
    });
  }
};