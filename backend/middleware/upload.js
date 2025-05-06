const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Configurar el almacenamiento con soporte para diferentes carpetas
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Determinar la carpeta de destino (parámetro opcional en la solicitud)
    let uploadFolder = '../uploads/';
    
    // Si hay un parámetro folder en el body, usarlo para determinar la subcarpeta
    if (req.body && req.body.folder) {
      switch(req.body.folder) {
        case 'team':
          uploadFolder = '../uploads/team/';
          break;
        case 'banners':
          uploadFolder = '../uploads/banners/';
          break;
        // Caso por defecto (productos)
        default:
          uploadFolder = '../uploads/products/';
      }
    } else {
      // Carpeta por defecto para productos
      uploadFolder = '../uploads/products/';
    }
    
    // Asegurar que la carpeta existe
    const fullPath = path.join(__dirname, uploadFolder);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: function(req, file, cb) {
    // Crear un nombre de archivo único usando timestamp y nombre original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// Filtrar archivos para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, gif, webp)'), false);
  }
};

// Configurar multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB
  },
  fileFilter: fileFilter
});

module.exports = upload;