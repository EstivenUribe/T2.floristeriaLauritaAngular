const mongoose = require('mongoose');

/**
 * Esquema para banners promocionales y de secciones
 * Permite administrar las imágenes destacadas en el sitio
 */
const BannerSchema = new mongoose.Schema({
  titulo: { 
    type: String, 
    required: [true, 'El título es obligatorio'],
    trim: true,
    maxlength: [100, 'El título no debe exceder los 100 caracteres']
  },
  subtitulo: { 
    type: String,
    trim: true,
    maxlength: [200, 'El subtítulo no debe exceder los 200 caracteres']
  },
  imagen: { 
    type: String, 
    required: [true, 'La imagen es obligatoria']
  },
  url: { 
    type: String,
    trim: true
  },
  seccion: { 
    type: String, 
    enum: {
      values: ['inicio', 'productos', 'ofertas', 'ocasiones', 'nosotros', 'contacto'],
      message: 'La sección {VALUE} no es válida'
    },
    required: [true, 'La sección es obligatoria']
  },
  fechaInicio: { 
    type: Date,
    default: Date.now
  },
  fechaFin: { 
    type: Date
  },
  orden: { 
    type: Number, 
    default: 0 
  },
  activo: { 
    type: Boolean, 
    default: true 
  },
  color: {
    textoPrincipal: {
      type: String,
      default: '#FFFFFF' // Blanco por defecto
    },
    textoSecundario: {
      type: String,
      default: '#FFFFFF' // Blanco por defecto
    },
    boton: {
      type: String,
      default: '#9966CC' // Color primario por defecto
    },
    overlay: {
      type: String,
      default: 'rgba(0,0,0,0.3)' // Overlay negro semitransparente por defecto
    }
  },
  animacion: {
    type: String,
    enum: ['none', 'fade', 'slide', 'zoom'],
    default: 'fade'
  },
  textoBoton: {
    type: String,
    trim: true,
    maxlength: [30, 'El texto del botón no debe exceder los 30 caracteres']
  },
  posicionTexto: {
    type: String,
    enum: ['left', 'center', 'right'],
    default: 'center'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para mejorar consultas
BannerSchema.index({ seccion: 1, activo: 1 });
BannerSchema.index({ fechaInicio: 1, fechaFin: 1 });

// Middlewares

// Asegura que fechaFin sea posterior a fechaInicio
BannerSchema.pre('save', function(next) {
  if (this.fechaFin && this.fechaInicio && this.fechaFin <= this.fechaInicio) {
    next(new Error('La fecha de fin debe ser posterior a la fecha de inicio'));
  } else {
    this.updatedAt = Date.now();
    next();
  }
});

// Métodos estáticos

// Obtener banners activos para una sección específica
BannerSchema.statics.findActiveBySection = function(section) {
  const now = new Date();
  
  return this.find({
    seccion: section,
    activo: true,
    $or: [
      // Sin fecha de fin o fecha fin posterior a hoy
      { fechaFin: { $exists: false } },
      { fechaFin: null },
      { fechaFin: { $gt: now } },
    ],
    // Fecha inicio anterior o igual a hoy
    fechaInicio: { $lte: now }
  }).sort({ orden: 1 });
};

// Método para obtener todos los banners activos
BannerSchema.statics.findAllActive = function() {
  const now = new Date();
  
  return this.find({
    activo: true,
    $or: [
      { fechaFin: { $exists: false } },
      { fechaFin: null },
      { fechaFin: { $gt: now } },
    ],
    fechaInicio: { $lte: now }
  }).sort({ seccion: 1, orden: 1 });
};

// Métodos de instancia

// Verificar si un banner está actualmente vigente
BannerSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  const isActive = this.activo && 
                  this.fechaInicio <= now && 
                  (!this.fechaFin || this.fechaFin > now);
  
  return isActive;
};

// Desactivar banner
BannerSchema.methods.deactivate = function() {
  this.activo = false;
  return this.save();
};

const Banner = mongoose.model('Banner', BannerSchema);

module.exports = Banner;