const jwt = require('jsonwebtoken');
require('dotenv').config();

// Obtener clave secreta desde variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'development_fallback_key';

// Proteger rutas (verificar token JWT)
exports.protect = (req, res, next) => {
  // Obtener token del encabezado Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // formato: "Bearer TOKEN"

  // También buscar el token en las cookies para CSRF protection
  const cookieToken = req.cookies?.token;

  // Usar el token del header o de las cookies
  const activeToken = token || cookieToken;

  if (!activeToken) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado' });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(activeToken, JWT_SECRET);
    
    // Verificar expiración
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return res.status(401).json({ 
        message: 'Token expirado', 
        expired: true 
      });
    }
    
    // Guardar datos del usuario en el objeto request
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    
    // Mensajes de error específicos
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expirado', 
        expired: true 
      });
    }
    
    res.status(401).json({ message: 'Token inválido o expirado' });
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