const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Campos básicos de identificación
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  
  // Campos de información personal (añadidos para coincidir con el frontend)
  firstName: String,
  lastName: String,
  address: String,
  city: String,
  state: String,
  zipCode: String,
  phone: String,
  birthDate: Date,
  
  // Campos de perfil y configuración
  avatarId: Number,
  profilePicture: String,
  emailVerified: {
    type: Boolean,
    default: false
  },
  
  // Campos de rol y estado
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Gestión de sesiones
  refreshTokens: [{
    token: String,
    expiresAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    },
    ip: String,
    userAgent: String
  }],
  lastLogin: {
    type: Date
  }
}, { 
  timestamps: true // Esto ya maneja createdAt y updatedAt automáticamente
});

// Índices compuestos
userSchema.index({ email: 1, username: 1 });
userSchema.index({ role: 1, isActive: 1 });

// Método para hash de contraseña antes de guardar
userSchema.pre('save', async function(next) {
  // Solo hash la contraseña si es nueva o ha sido modificada
  if (!this.isModified('password')) return next();
  
  try {
    // Generar un salt
    const salt = await bcrypt.genSalt(10);
    // Crear hash con el salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!candidatePassword || !this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Método para guardar un refresh token
userSchema.methods.addRefreshToken = function(token, expiresIn, ip, userAgent) {
  // Limpiar tokens expirados primero
  this.refreshTokens = this.refreshTokens.filter(t => 
    t.expiresAt && t.expiresAt > new Date()
  );
  
  // Limitar la cantidad de tokens de refresco activos por usuario (para seguridad)
  const MAX_REFRESH_TOKENS = 5;
  if (this.refreshTokens.length >= MAX_REFRESH_TOKENS) {
    // Eliminar el token más antiguo
    this.refreshTokens.sort((a, b) => a.createdAt - b.createdAt);
    this.refreshTokens.shift();
  }
  
  // Calcular fecha de expiración basada en la string de JWT (ejemplo: '7d')
  const expiresAt = new Date();
  const match = expiresIn.match(/^(\d+)([smhdwy])$/);
  if (match) {
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch(unit) {
      case 's': expiresAt.setSeconds(expiresAt.getSeconds() + value); break;
      case 'm': expiresAt.setMinutes(expiresAt.getMinutes() + value); break;
      case 'h': expiresAt.setHours(expiresAt.getHours() + value); break;
      case 'd': expiresAt.setDate(expiresAt.getDate() + value); break;
      case 'w': expiresAt.setDate(expiresAt.getDate() + (value * 7)); break;
      case 'y': expiresAt.setFullYear(expiresAt.getFullYear() + value); break;
    }
  } else {
    // Default: 7 días
    expiresAt.setDate(expiresAt.getDate() + 7);
  }
  
  // Añadir el nuevo token
  this.refreshTokens.push({
    token,
    expiresAt,
    createdAt: new Date(),
    ip: ip || 'unknown',
    userAgent: userAgent || 'unknown'
  });
};

// Método para verificar si un refresh token está almacenado y válido
userSchema.methods.hasValidRefreshToken = function(token) {
  return this.refreshTokens.some(t => 
    t.token === token && t.expiresAt > new Date()
  );
};

// Método para eliminar un refresh token específico
userSchema.methods.removeRefreshToken = function(token) {
  this.refreshTokens = this.refreshTokens.filter(t => t.token !== token);
};

// Método para eliminar todos los refresh tokens
userSchema.methods.clearRefreshTokens = function() {
  this.refreshTokens = [];
};

module.exports = mongoose.model('User', userSchema);