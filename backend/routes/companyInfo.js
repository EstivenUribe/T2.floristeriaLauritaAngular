const express = require('express');
const router = express.Router();
const companyInfoController = require('../controllers/companyInfoController');
const { verifyAdmin } = require('../middleware/auth');

// Rutas públicas
router.get('/', companyInfoController.getCompanyInfo);

// Rutas protegidas (solo admin)
router.put('/', verifyAdmin, companyInfoController.updateCompanyInfo);

module.exports = router;