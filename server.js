/**
 * Main server entry point
 * Initializes database connection and starts Express server
 */
require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');
const app = require('./app');
const db = require('./backend/config/db');

const port = process.env.PORT || 3000;

// Variable para el proceso de Angular
let angularProcess = null;

// Función para iniciar Angular
function startAngular() {
  console.log('Iniciando la aplicación de Angular...');
  
  angularProcess = spawn('npm', ['start'], {
    cwd: path.join(__dirname, 'angular-frontend'),
    stdio: 'inherit',
    shell: true
  });
  
  angularProcess.on('error', (error) => {
    console.error('Error al iniciar Angular:', error);
  });
  
  angularProcess.on('close', (code) => {
    console.log(`Proceso de Angular terminado con código ${code}`);
  });
}

// Manejar cierre de la aplicación
process.on('SIGINT', async () => {
  if (angularProcess) {
    angularProcess.kill();
  }
  
  try {
    await db.close();
  } catch (err) {
    console.error('Error al cerrar la conexión de MongoDB:', err.message);
  }
  
  console.log('Aplicación cerrada correctamente');
  process.exit(0);
});

/**
 * Inicia el servidor Express con estado de conexión a la BD
 * @param {boolean} isDbConnected - Si la conexión a MongoDB está activa
 */
function startServer(isDbConnected = true) {
  // Middleware para indicar el estado de la conexión a la BD
  app.use((req, res, next) => {
    req.dbConnected = isDbConnected;
    next();
  });

  // Iniciar el servidor Express
  app.listen(port, () => {
    if (isDbConnected) {
      console.log(`🚀 Servidor escuchando en http://localhost:${port} con acceso a la base de datos`);
    } else {
      console.log(`🚀 Servidor escuchando en http://localhost:${port} en modo limitado (sin base de datos)`);
    }
    
    // Solo cuando estamos en modo desarrollo
    if (process.env.NODE_ENV === 'development' && process.env.STANDALONE === 'true') {
      startAngular();
    }
  });
}

// Intentar conectar a MongoDB y luego iniciar el servidor
(async function bootstrap() {
  console.log('🔄 Inicializando aplicación...');
  
  try {
    // Intentar conectar a MongoDB (Atlas o local como fallback)
    const dbConnection = await db.connect();
    
    // Si la conexión es exitosa, iniciar el servidor con acceso a la BD
    startServer(true);
    
    if (!dbConnection.usingAtlas) {
      console.log('⚠️ Usando MongoDB local. Para usar Atlas, configure correctamente MONGODB_URI en .env');
    }
  } catch (error) {
    // Si ambas conexiones fallan, iniciar el servidor en modo limitado
    console.error('❌ No se pudo conectar a ninguna base de datos:', error.message);
    console.log('⚠️ Iniciando servidor en modo limitado (sin acceso a la base de datos)');
    startServer(false);
  }
})();