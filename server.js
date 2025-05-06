const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const port = 3000;
const { spawn } = require('child_process');

// Middleware para parsear JSON en las peticiones POST/PUT
app.use(express.json()); 

// Middleware para CORS
const cors = require('cors');
app.use(cors());

// Importación de modelos
const Product = require('./backend/models/product');
const CompanyInfo = require('./backend/models/companyInfo');
const User = require('./backend/models/user');
const Review = require('./backend/models/review');
const Cart = require('./backend/models/cart');

// Importación de rutas
const productRoutes = require('./backend/routes/products');
const companyInfoRoutes = require('./backend/routes/companyInfo');
const authRoutes = require('./backend/routes/auth');
const reviewRoutes = require('./backend/routes/reviews');
const cartRoutes = require('./backend/routes/cart');
const uploadsRoutes = require('./backend/routes/uploads');
const teamRoutes = require('./backend/routes/team');
const bannersRoutes = require('./backend/routes/banners');

// --- Rutas API ---

// Usar las rutas importadas con prefijos de API
app.use('/api/productos', productRoutes);
app.use('/api/company-info', companyInfoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/banners', bannersRoutes);

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
    
    // Usar spawn para iniciar un proceso hijo
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

// Conectar a MongoDB primero, luego iniciar el servidor Express
mongoose.connect('mongodb+srv://MongodbPrueba:asdfqwer1234@parcial.a6gbmrh.mongodb.net/?retryWrites=true&w=majority&appName=Parcial')
    .then(() => {
        console.log('🟢 Conexión a MongoDB establecida');
        
        // Iniciar el servidor Express
        app.listen(port, () => {
            console.log(`🚀 Servidor de API escuchando en http://localhost:${port}`);
            
            // Solo cuando estamos en modo desarrollo y no se inició con npm run dev
            if (process.env.NODE_ENV === 'development' && process.env.STANDALONE === 'true') {
                startAngular();
            }
        });
    })
    .catch(err => {
        console.error('🔴 Error al conectar con MongoDB:', err);
        process.exit(1); // Terminar con error
    });