/**
 * Middleware para logging de peticiones HTTP
 * Filtra logs innecesarios como peticiones GET sin origin/content-type
 */
const requestLogger = (req, res, next) => {
  // Ignorar peticiones GET que no tienen origin ni content-type
  // Estas son típicamente navegación directa o uso de herramientas
  const skipLogging = req.method === 'GET' && 
                     (!req.headers.origin || req.headers.origin === '') &&
                     (!req.headers['content-type'] || req.headers['content-type'] === '');
  
  if (!skipLogging) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Origin: ${req.headers.origin || 'No origin'}, Content-Type: ${req.headers['content-type'] || 'No content-type'}`);
  }
  
  next();
};

module.exports = requestLogger;
