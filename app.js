/**
 * Express Application Configuration
 * Sets up middleware, routes, and static file serving
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Función para determinar qué solicitudes comprimir
const shouldCompress = (req, res) => {
  // No comprimir archivos pequeños o imágenes ya comprimidas
  if (req.path.match(/\.(jpg|jpeg|png|gif|webp|ico|svg|woff|woff2|ttf|eot)$/)) {
    return false;
  }
  
  // Solo comprimir si no hay header 'x-no-compression'
  return req.headers['x-no-compression'] ? false : compression.filter(req, res);
};

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'wss:', 'ws:']
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Compresión para mejorar el rendimiento
app.use(compression({ filter: shouldCompress }));

// Middleware de CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true,
  exposedHeaders: ['X-CSRF-Token'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Parser para JSON y cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Debug middleware para API errors
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

// Configuración para caché
const cacheTime = {
  images: 60 * 60 * 24 * 7, // 7 días para imágenes
  assets: 60 * 60 * 24 * 30, // 30 días para assets estáticos
  html: 0 // Sin caché para HTML (siempre fresco)
};

// Middleware para añadir cabeceras de caché
const staticOptions = (maxAge) => ({
  maxAge: maxAge * 1000, // Convertir a ms
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Asegurar que los recursos estáticos no se almacenen en memoria caché sensible
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else {
      res.setHeader('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=86400`);
    }
  }
});

// Configuración para servir archivos estáticos con caché
// Archivos de uploads (imágenes)
app.use('/uploads', express.static(
  path.join(__dirname, 'backend/uploads'), 
  staticOptions(cacheTime.images)
));
app.use('/uploads/products', express.static(
  path.join(__dirname, 'backend/uploads/products'), 
  staticOptions(cacheTime.images)
));
app.use('/uploads/team', express.static(
  path.join(__dirname, 'backend/uploads/team'), 
  staticOptions(cacheTime.images)
));
app.use('/uploads/banners', express.static(
  path.join(__dirname, 'backend/uploads/banners'), 
  staticOptions(cacheTime.images)
));

// Servir archivos estáticos de assets directamente desde la carpeta src
app.use('/assets', express.static(
  path.join(__dirname, 'angular-frontend/src/assets'),
  staticOptions(cacheTime.images)
));

// Servir archivos de Angular con diferentes configuraciones de caché según el tipo
app.use(express.static(
  path.join(__dirname, 'angular-frontend/dist/angular-frontend/browser'),
  {
    setHeaders: (res, filePath) => {
      // Archivos de contenido dinámico (HTML) - Sin caché
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      } 
      // Assets versionados (con hash en el nombre)
      else if (filePath.match(/\.(js|css|jpe?g|png|gif|ico|svg|webp|woff2?)(\?[a-z0-9=]*)?$/)) {
        // Archivos con hash pueden tener una caché larga
        if (filePath.match(/\.[a-f0-9]{8,}\.(js|css|jpe?g|png|gif|svg|webp|woff2?)$/)) {
          res.setHeader('Cache-Control', `public, max-age=${cacheTime.assets}, immutable`);
        } 
        // Recursos sin hash - caché moderada
        else {
          res.setHeader('Cache-Control', `public, max-age=${cacheTime.assets / 10}, stale-while-revalidate=86400`);
        }
      }
    }
  }
));

// Middleware de fallback para rutas de API en caso de error de BD
app.use('/api/*', (req, res, next) => {
  // Si la base de datos está conectada, continuar con la siguiente ruta
  if (req.dbConnected === false) {
    return res.status(503).json({
      message: 'Base de datos no disponible. Intente de nuevo más tarde.',
      error: 'db_connection_error'
    });
  }
  next();
});

// Ruta para manejar HTML5 History Mode (para SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'angular-frontend/dist/angular-frontend/browser', 'index.html'));
});

// Exportar la app configurada
module.exports = app;