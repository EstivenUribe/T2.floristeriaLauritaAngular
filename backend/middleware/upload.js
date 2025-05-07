const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Configurar el almacenamiento con soporte para diferentes carpetas
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Determinar la carpeta de destino (parámetro opcional en la solicitud)
    let targetFolder;
    let backupFolder;

    // Carpeta por defecto si no se especifica otra cosa
    const defaultFolder = 'products';
    
    // Si hay un parámetro folder en el body, usarlo para determinar la subcarpeta
    const requestedFolder = (req.body && req.body.folder) ? req.body.folder : defaultFolder;
    
    // Folder en assets de Angular (ubicación principal)
    const assetsPath = path.join(__dirname, '../../angular-frontend/src/assets/images/');
    
    // Crear un mapa de rutas para las carpetas
    const folders = {
      'products': `${assetsPath}products/`,
      'team': `${assetsPath}team/`,
      'banners': `${assetsPath}banners/`,
      'categories': `${assetsPath}categories/`,
      'general': `${assetsPath}general/`
    };
    
    // Establecer la carpeta principal en assets
    targetFolder = folders[requestedFolder] || folders[defaultFolder];
    
    // Establecer una carpeta de respaldo para compatibilidad
    backupFolder = path.join(__dirname, '../uploads/', requestedFolder);
    
    // Crear ambas carpetas si no existen
    [targetFolder, backupFolder].forEach(folder => {
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
      }
    });
    
    // Guardar la ruta relativa para usarla en el controlador
    req.uploadFolderType = requestedFolder;
    req.uploadFolderRelativePath = `/assets/images/${requestedFolder}/`;
    
    cb(null, targetFolder);
  },
  filename: function(req, file, cb) {
    // Sanitizar el nombre del archivo original
    const originalName = file.originalname.toLowerCase().replace(/[^a-z0-9.]/g, '-');
    
    // Obtener extensión
    const extension = path.extname(originalName);
    
    // Crear nombre base
    const baseName = path.basename(originalName, extension).substring(0, 20);
    
    // Crear un nombre de archivo único usando timestamp y nombre sanitizado
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E6);
    const fileName = `${baseName}-${uniqueSuffix}${extension}`;
    
    // Guardar el nombre de archivo para usarlo en el controlador
    req.uploadedFileName = fileName;
    req.uploadedFilePath = `${req.uploadFolderRelativePath}${fileName}`;
    
    cb(null, fileName);
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