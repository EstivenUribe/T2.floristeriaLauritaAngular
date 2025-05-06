const CompanyInfo = require('../models/companyInfo');

// Obtener información de la empresa
exports.getCompanyInfo = async (req, res) => {
  try {
    const info = await CompanyInfo.findOne();
    res.json(info || { message: 'No hay información disponible' });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener información de la empresa',
      error: error.message
    });
  }
};

// Actualizar información de la empresa
exports.updateCompanyInfo = async (req, res) => {
  try {
    // Buscar si ya existe información
    let info = await CompanyInfo.findOne();
    
    if (info) {
      // Actualizar
      info = await CompanyInfo.findByIdAndUpdate(
        info._id,
        req.body,
        { new: true }
      );
    } else {
      // Crear nuevo documento
      info = new CompanyInfo(req.body);
      await info.save();
    }
    
    res.json(info);
  } catch (error) {
    res.status(400).json({
      message: 'Error al actualizar información de la empresa',
      error: error.message
    });
  }
};