const jwt = require('jsonwebtoken');

// Clave secreta para JWT (en producción usar variables de entorno)
const JWT_SECRET = 'floristeria_laurita_secret_key';

// Verificar token JWT
exports.verifyToken = (req, res, next) => {
  // Obtener token del encabezado Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // formato: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado' });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Guardar datos del usuario en el objeto request
    req.userId = decoded.id;
    req.userRole = decoded.role;
    
    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// Verificar si el usuario es administrador
exports.isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador' });
  }
  next();
};

// Middleware que combina verificación de token y rol admin
exports.verifyAdmin = [
  exports.verifyToken,
  exports.isAdmin
];