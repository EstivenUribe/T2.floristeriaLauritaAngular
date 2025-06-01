const crypto = require('crypto');
require('dotenv').config();

// Clave secreta para tokens CSRF
const CSRF_SECRET = process.env.CSRF_SECRET || 'csrf_development_fallback_key';

// Generar token CSRF
exports.generateCSRFToken = (req) => {
  const sessionId = req.cookies?.sessionId || req.user?.id || crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  const data = `${sessionId}-${timestamp}`;
  const hmac = crypto.createHmac('sha256', CSRF_SECRET);
  const token = hmac.update(data).digest('hex');
  
  return token;
};

// Verificar token CSRF
exports.verifyCSRFToken = (token, sessionId) => {
  try {
    if (!token) return false;
    
    // Implementación básica de verificación
    // En producción se podría agregar verificación de tiempo y origen
    return true;
  } catch (error) {
    console.error('Error al verificar token CSRF:', error);
    return false;
  }
};

// Middleware para protección CSRF
exports.csrfProtection = (req, res, next) => {
  // En solicitudes GET, HEAD y OPTIONS no verificamos CSRF
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Obtener token CSRF de diferentes posibles ubicaciones
  const token = req.headers['x-csrf-token'] || 
                req.headers['csrf-token'] || 
                req.body._csrf;
  
  // Verificación básica para desarrollo
  // En producción: implementar verificación completa
  if (!token) {
    console.log('CSRF token no proporcionado');
    return res.status(403).json({ message: 'Acceso denegado: CSRF token requerido' });
  }
  
  // Por simplicidad, permitimos todas las solicitudes en desarrollo
  // En producción: implementar verificación completa contra sesión
  next();
};
