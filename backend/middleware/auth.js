const jwt = require('jsonwebtoken');
require('dotenv').config();

// Obtener clave secreta desde variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'development_fallback_key';

// Proteger rutas (verificar token JWT)
exports.protect = (req, res, next) => {
  // Obtener token de múltiples fuentes posibles
  let token = null;
  
  // 1. Obtener token del encabezado Authorization
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  
  // 2. Obtener token de las cookies
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  
  // 3. Obtener token del body (para APIs)
  if (!token && req.body && req.body.token) {
    token = req.body.token;
  }
  
  // 4. Obtener token del query param (para callbacks, verificaciones por email, etc.)
  if (!token && req.query && req.query.token) {
    token = req.query.token;
  }
  
  // Log para depuración (quitar en producción)
  console.log('Token source:', token ? 
    `${authHeader ? 'Header' : req.cookies?.token ? 'Cookie' : req.body?.token ? 'Body' : 'Query'}` : 
    'No token found');

  // Si no hay token en ninguna fuente, denegar acceso
  if (!token) {
    console.log('No se encontró token de autenticación');
    return res.status(401).json({ 
      message: 'Acceso denegado. Token no proporcionado',
      error: 'no_token'
    });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar expiración
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      console.log('Token expirado');
      return res.status(401).json({ 
        message: 'Token expirado', 
        expired: true,
        error: 'token_expired' 
      });
    }
    
    // Guardar datos del usuario en el objeto request
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.user = decoded;
    
    // Log exitoso
    console.log(`Usuario autenticado: ID=${decoded.id}, Role=${decoded.role}`);
    
    next();
  } catch (error) {
    console.error('Error al verificar token:', error.message);
    
    // Mensajes de error específicos
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expirado', 
        expired: true,
        error: 'token_expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token inválido', 
        error: 'invalid_token'
      });
    }
    
    res.status(401).json({ 
      message: 'Error de autenticación', 
      error: error.message 
    });
  }
};

// Verificar si el usuario es administrador
exports.admin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador' });
  }
  next();
};

// Middleware para validar CSRF token
exports.csrfProtection = (req, res, next) => {
  // Para llamadas API sin navegador (ej: aplicaciones móviles o Postman)
  // podemos tener un bypass controlado
  const bypassCSRF = req.headers['x-bypass-csrf'] === process.env.CSRF_BYPASS_SECRET;
  
  if (bypassCSRF && process.env.NODE_ENV !== 'production') {
    return next();
  }
  
  // Verificar que el csrf token coincida
  const csrfTokenFromHeader = req.headers['x-csrf-token'];
  const csrfTokenFromCookie = req.cookies?.csrfToken;
  
  if (!csrfTokenFromHeader || !csrfTokenFromCookie || csrfTokenFromHeader !== csrfTokenFromCookie) {
    return res.status(403).json({ message: 'CSRF token inválido o no proporcionado' });
  }
  
  next();
};

// Alias para compatibilidad con código existente
exports.verifyToken = exports.protect;
exports.isAdmin = exports.admin;

// Middleware que combina verificación de token y rol admin
exports.verifyAdmin = [
  exports.protect,
  exports.admin
];