const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware for API errors
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    if (res.statusCode >= 400) {
      console.error(`ERROR ${res.statusCode} on ${req.method} ${req.originalUrl}:`, data);
    }
    return originalSend.call(this, data);
  };
  next();
});

// Importación de rutas
const productRoutes = require('./backend/routes/products');
const companyInfoRoutes = require('./backend/routes/companyInfo');
const authRoutes = require('./backend/routes/auth');
const reviewRoutes = require('./backend/routes/reviews');
const cartRoutes = require('./backend/routes/cart');
const uploadRoutes = require('./backend/routes/uploads');
const teamRoutes = require('./backend/routes/team');
const bannerRoutes = require('./backend/routes/banners');

// Rutas API
app.use('/api/productos', productRoutes);
app.use('/api/company-info', companyInfoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/banners', bannerRoutes);

// Configuración para servir archivos estáticos
// Archivos de uploads
app.use('/uploads', express.static(path.join(__dirname, 'backend/uploads')));
app.use('/uploads/products', express.static(path.join(__dirname, 'backend/uploads/products')));
app.use('/uploads/team', express.static(path.join(__dirname, 'backend/uploads/team')));
app.use('/uploads/banners', express.static(path.join(__dirname, 'backend/uploads/banners')));

// Archivos compilados de Angular
app.use(express.static(path.join(__dirname, 'angular-frontend/dist/angular-frontend/browser')));

// Ruta para manejar HTML5 History Mode (para SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'angular-frontend/dist/angular-frontend/browser', 'index.html'));
});

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

// Limpiar procesos al cerrar
process.on('SIGINT', () => {
    if (angularProcess) {
        angularProcess.kill();
    }
    process.exit(0);
});

// Usar configuración de base de datos
const dbConfig = require('./backend/config/db');
const dbUrl = process.env.MONGODB_URI || dbConfig.url;

// Conectar a MongoDB y luego iniciar el servidor Express
mongoose.connect(dbUrl)
    .then(() => {
        console.log('🟢 Conexión a MongoDB establecida');
        
        // Iniciar el servidor Express
        app.listen(port, () => {
            console.log(`🚀 Servidor de API escuchando en http://localhost:${port}`);
            
            // Solo cuando estamos en modo desarrollo
            if (process.env.NODE_ENV === 'development' && process.env.STANDALONE === 'true') {
                startAngular();
            }
        });
    })
    .catch(err => {
        console.error('🔴 Error al conectar con MongoDB:', err);
        process.exit(1); // Terminar con error
    });