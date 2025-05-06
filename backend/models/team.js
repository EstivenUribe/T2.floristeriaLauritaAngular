const mongoose = require('mongoose');

/**
 * Esquema para los miembros del equipo de la empresa
 * Permite guardar información sobre el personal que se muestra en la sección "Sobre Nosotros"
 */
const TeamMemberSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: [true, 'El nombre es obligatorio']
  },
  apellido: { 
    type: String, 
    required: [true, 'El apellido es obligatorio']
  },
  cargo: { 
    type: String, 
    required: [true, 'El cargo es obligatorio']
  },
  foto: { 
    type: String, 
    required: [true, 'La foto es obligatoria']
  },
  biografia: { 
    type: String, 
    required: [true, 'La biografía es obligatoria'],
    minlength: [50, 'La biografía debe tener al menos 50 caracteres'],
    maxlength: [500, 'La biografía no debe exceder los 500 caracteres']
  },
  orden: { 
    type: Number, 
    default: 0 
  },
  activo: { 
    type: Boolean, 
    default: true 
  },
  redesSociales: {
    facebook: { type: String },
    instagram: { type: String },
    twitter: { type: String },
    linkedin: { type: String }
  },
  fechaCreacion: { 
    type: Date, 
    default: Date.now 
  },
  fechaActualizacion: { 
    type: Date,
    default: Date.now 
  }
}, {
  timestamps: true, // Añade createdAt y updatedAt automáticamente
  toJSON: { virtuals: true }, // Habilita propiedades virtuales cuando se convierte a JSON
  toObject: { virtuals: true } // Habilita propiedades virtuales cuando se convierte a objeto
});

// Propiedad virtual para nombre completo
TeamMemberSchema.virtual('nombreCompleto').get(function() {
  return `${this.nombre} ${this.apellido}`;
});

// Middleware para actualizar fechaActualizacion antes de guardar
TeamMemberSchema.pre('save', function(next) {
  this.fechaActualizacion = Date.now();
  next();
});

// Método estático para encontrar miembros activos ordenados
TeamMemberSchema.statics.findActiveAndSorted = function() {
  return this.find({ activo: true }).sort({ orden: 1, nombre: 1 });
};

// Método de instancia para ocultar miembro sin eliminarlo
TeamMemberSchema.methods.desactivar = function() {
  this.activo = false;
  return this.save();
};

const TeamMember = mongoose.model('TeamMember', TeamMemberSchema);

module.exports = TeamMember;