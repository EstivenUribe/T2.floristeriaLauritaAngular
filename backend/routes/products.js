const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
const productsUploadsDir = path.join(uploadsDir, 'products');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(productsUploadsDir)) {
  fs.mkdirSync(productsUploadsDir);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, productsUploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
  }
});

// File filter for images
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen.'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter });

// Rutas públicas
router.get('/', productController.getAllProducts);
router.get('/light', productController.getLightProducts);
router.get('/categorias', productController.getCategorias);
router.get('/destacados', productController.getFeaturedProducts);
router.get('/:id', productController.getProductById);

// Rutas protegidas (solo admin)
router.post('/', verifyAdmin, upload.single('imagen'), productController.createProduct);
router.put('/:id', verifyAdmin, upload.single('imagen'), productController.updateProduct);
router.delete('/:id', verifyAdmin, productController.deleteProduct);

module.exports = router;