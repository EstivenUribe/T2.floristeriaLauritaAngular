const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Configurar multer para subir imágenes de miembros del equipo
const teamUpload = upload.single('foto');

// Rutas públicas - Accesibles sin autenticación
router.get('/', teamController.getAllTeamMembers);
router.get('/:id', teamController.getTeamMemberById);

// Rutas privadas - Solo para administradores
router.post('/', protect, admin, teamUpload, teamController.createTeamMember);
router.put('/:id', protect, admin, teamUpload, teamController.updateTeamMember);
router.patch('/:id/toggle-status', protect, admin, teamController.toggleMemberStatus);
router.delete('/:id', protect, admin, teamController.deleteTeamMember);
router.put('/reorder', protect, admin, teamController.reorderTeamMembers);

module.exports = router;