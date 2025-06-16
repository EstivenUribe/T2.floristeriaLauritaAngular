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
// Consider reviewing Content Security Policy directives, especially 'unsafe-inline' and 'unsafe-eval' for enhanced security.
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

// Middleware de CORS - configuración mejorada
const corsOptions = {
  // Permitir tanto localhost:4200 (Angular dev server) como localhost:3000 (backend)
  origin: function(origin, callback) {
    const whitelist = [
      process.env.CORS_ORIGIN || 'http://localhost:4200', // Fallback para desarrollo local
      'http://localhost:4200', // Frontend local Angular
      'http://localhost:3000', // Backend local directo
      'http://localhost',      // IIS proxy local
      'http://localhost:80',   // IIS proxy local puerto 80
      'https://www.floristerialaurita.com' // Dominio de producción
    ];

    // Log para verificar la whitelist y el CORS_ORIGIN al inicio
    console.log('CORS Whitelist:', whitelist);
    if (process.env.CORS_ORIGIN) {
      console.log('process.env.CORS_ORIGIN:', process.env.CORS_ORIGIN);
    } else {
      console.log('process.env.CORS_ORIGIN is not set. Using default whitelist entries.');
    }

    // Permitir solicitudes sin origen (como llamadas de API móviles o Postman)
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error(`CORS blocked request from: ${origin}`);
      callback(new Error(`CORS policy: origen ${origin} no permitido`));
    }
  },
  credentials: true, // Permitir cookies en solicitudes cross-origin
  exposedHeaders: ['X-CSRF-Token', 'Content-Type'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With', 'Accept', 'Origin']
};

// Aplicar configuración CORS
app.use(cors(corsOptions));

// Middleware para depurar solicitudes CORS (comentado para reducir ruido en consola)
/*
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'}, Content-Type: ${req.headers['content-type'] || 'No content-type'}`);
  next();
});
*/

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
const orderRoutes = require('./backend/routes/orders');
const csrfRoutes = require('./backend/routes/csrf');

// Rutas API
app.use('/api/productos', productRoutes);
app.use('/api/company-info', companyInfoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/csrf', csrfRoutes);

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

// Root path serves admin login page
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Floristería Laurita - Panel de Administración</title>
      <style>
        :root {
          --primary-color: #7e57c2;  /* Lila principal */
          --primary-dark: #5e35b1;   /* Lila oscuro */
          --primary-light: #b39ddb;  /* Lila claro */
          --background: #f3e5f5;     /* Fondo lila muy claro */
          --text: #4a148c;           /* Texto morado oscuro */
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: var(--background);
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          color: var(--text);
          background-image: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
        }
        
        .container {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(126, 87, 194, 0.2);
          padding: 2.5rem;
          width: 100%;
          max-width: 380px;
          text-align: center;
          border: 1px solid rgba(126, 87, 194, 0.1);
        }
        
        .logo {
          margin-bottom: 1.5rem;
        }
        
        h1 {
          color: var(--primary-color);
          margin: 0 0 0.5rem 0;
          font-weight: 700;
          font-size: 1.8rem;
        }
        
        h2 {
          color: var(--primary-dark);
          margin: 0 0 1.5rem 0;
          font-weight: 500;
          font-size: 1.2rem;
        }
        
        .login-form {
          display: flex;
          flex-direction: column;
        }
        
        .form-group {
          margin-bottom: 1.25rem;
          text-align: left;
        }
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--text);
        }
        
        input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e1bee7;
          border-radius: 6px;
          font-size: 16px;
          box-sizing: border-box;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        
        input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(126, 87, 194, 0.2);
        }
        
        button {
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: 6px;
          padding: 0.85rem;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        button:hover {
          background-color: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(126, 87, 194, 0.3);
        }
        
        button:active {
          transform: translateY(0);
        }
        
        .status {
          margin: 1.25rem 0;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          font-size: 14px;
          display: none;
          line-height: 1.5;
        }
        
        .error {
          background-color: #fce4ec;
          color: #c2185b;
          border-left: 4px solid #c2185b;
        }
        
        .success {
          background-color: #f1f8e9;
          color: #2e7d32;
          border-left: 4px solid #2e7d32;
        }
        
        .footer {
          margin-top: 2rem;
          font-size: 13px;
          color: #9c27b0;
          opacity: 0.8;
        }
        
        .footer p {
          margin: 0.25rem 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
  <h1>🌸 Floristería Laurita</h1>
  <h2>Panel de Administración</h2>
</div>
        <div id="status" class="status"></div>
        <form id="loginForm" class="login-form">
          <div class="form-group">
            <label for="password">Contraseña de Administrador</label>
            <input type="password" id="password" name="password" required autofocus>
          </div>
          <button type="submit" class="login-button">Acceder</button>
        </form>
        <div class="footer">
  <p>Acceso exclusivo para personal autorizado</p>
  <p> ${new Date().getFullYear()} Floristería Laurita</p>
</div>
      </div>

      <script>
        const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = document.getElementById('password').value;
  const statusEl = document.getElementById('status');
  try {
    if (password === 'admin123') {
      statusEl.textContent = 'Acceso concedido. Redirigiendo...';
      statusEl.className = 'status success';
      setTimeout(() => {
        window.location.replace('http://localhost:4200/admin');
      }, 800);
    } else {
      statusEl.textContent = 'Acceso denegado. Se requieren permisos de administrador.';
      statusEl.className = 'status error';
    }
  } catch (error) {
    statusEl.textContent = 'Error al conectar con el servidor. Intenta nuevamente.';
    statusEl.className = 'status error';
    console.error('Error:', error);
  }
});
      </script>
    </body>
    </html>
  `);
});

// Exportar la app configurada
module.exports = app;