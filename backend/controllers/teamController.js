const TeamMember = require('../models/team');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Obtener todos los miembros del equipo
 * @route   GET /api/team
 * @access  Public
 */
exports.getAllTeamMembers = async (req, res) => {
  try {
    // Opcionalmente filtrar solo miembros activos si se especifica en la consulta
    const filter = req.query.onlyActive === 'true' ? { activo: true } : {};
    
    // Ordenar según el campo orden y luego por nombre
    const members = await TeamMember.find(filter).sort({ orden: 1, nombre: 1 });
    
    res.status(200).json({
      success: true,
      count: members.length,
      data: members
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener miembros del equipo',
      error: error.message
    });
  }
};

/**
 * @desc    Obtener un miembro del equipo por ID
 * @route   GET /api/team/:id
 * @access  Public
 */
exports.getTeamMemberById = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Miembro del equipo no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: member
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener miembro del equipo',
      error: error.message
    });
  }
};

/**
 * @desc    Crear un nuevo miembro del equipo
 * @route   POST /api/team
 * @access  Private (Admin only)
 */
exports.createTeamMember = async (req, res) => {
  try {
    // Si se recibe un archivo de imagen, se procesa
    if (req.file) {
      req.body.foto = req.file.filename;
    }
    
    // Crear el nuevo miembro
    const newMember = await TeamMember.create(req.body);
    
    res.status(201).json({
      success: true,
      data: newMember,
      message: 'Miembro del equipo creado exitosamente'
    });
  } catch (error) {
    // Si hay un error y se subió una imagen, eliminarla
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/team', req.file.filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error al eliminar imagen:', err);
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Error al crear miembro del equipo',
      error: error.message
    });
  }
};

/**
 * @desc    Actualizar un miembro del equipo
 * @route   PUT /api/team/:id
 * @access  Private (Admin only)
 */
exports.updateTeamMember = async (req, res) => {
  try {
    let member = await TeamMember.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Miembro del equipo no encontrado'
      });
    }
    
    // Si se recibe un archivo de imagen, se procesa y se borra la anterior
    if (req.file) {
      // Borrar la imagen anterior si existe
      if (member.foto) {
        const oldFilePath = path.join(__dirname, '../uploads/team', member.foto);
        fs.unlink(oldFilePath, (err) => {
          if (err && err.code !== 'ENOENT') console.error('Error al eliminar imagen anterior:', err);
        });
      }
      
      req.body.foto = req.file.filename;
    }
    
    // Actualizar el miembro
    member = await TeamMember.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: member,
      message: 'Miembro del equipo actualizado exitosamente'
    });
  } catch (error) {
    // Si hay un error y se subió una imagen, eliminarla
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/team', req.file.filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error al eliminar imagen:', err);
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Error al actualizar miembro del equipo',
      error: error.message
    });
  }
};

/**
 * @desc    Cambiar estado (activo/inactivo) de un miembro del equipo
 * @route   PATCH /api/team/:id/toggle-status
 * @access  Private (Admin only)
 */
exports.toggleMemberStatus = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Miembro del equipo no encontrado'
      });
    }
    
    // Cambiar el estado
    member.activo = !member.activo;
    await member.save();
    
    res.status(200).json({
      success: true,
      data: member,
      message: `Miembro del equipo ${member.activo ? 'activado' : 'desactivado'} exitosamente`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al cambiar estado del miembro del equipo',
      error: error.message
    });
  }
};

/**
 * @desc    Eliminar un miembro del equipo
 * @route   DELETE /api/team/:id
 * @access  Private (Admin only)
 */
exports.deleteTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Miembro del equipo no encontrado'
      });
    }
    
    // Eliminar la imagen asociada si existe
    if (member.foto) {
      const filePath = path.join(__dirname, '../uploads/team', member.foto);
      fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') console.error('Error al eliminar imagen:', err);
      });
    }
    
    await member.remove();
    
    res.status(200).json({
      success: true,
      message: 'Miembro del equipo eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar miembro del equipo',
      error: error.message
    });
  }
};

/**
 * @desc    Reordenar miembros del equipo
 * @route   PUT /api/team/reorder
 * @access  Private (Admin only)
 */
exports.reorderTeamMembers = async (req, res) => {
  try {
    const { members } = req.body; // Arreglo de objetos {id, orden}
    
    if (!Array.isArray(members)) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un arreglo de miembros'
      });
    }
    
    // Actualizar el orden de cada miembro
    const updatePromises = members.map(item => 
      TeamMember.findByIdAndUpdate(
        item.id, 
        { orden: item.orden },
        { new: true }
      )
    );
    
    await Promise.all(updatePromises);
    
    res.status(200).json({
      success: true,
      message: 'Orden de miembros actualizado exitosamente'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al reordenar miembros del equipo',
      error: error.message
    });
  }
};