const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const port = 3000;

// Middleware para parsear JSON en las peticiones POST/PUT
app.use(express.json()); 

// Middleware para CORS
const cors = require('cors');
app.use(cors());

// Conexión a MongoDB
mongoose.connect('mongodb+srv://MongodbPrueba:asdfqwer1234@parcial.a6gbmrh.mongodb.net/?retryWrites=true&w=majority&appName=Parcial')
    .then(() => console.log('Conexión a MongoDB establecida'))
    .catch(err => console.error('Error al conectar con MongoDB:', err));

// Configuración para servir archivos estáticos (compilados de Angular)
app.use(express.static(path.join(__dirname, 'angular-frontend/dist/angular-frontend/browser')));

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

// --- Rutas API ---

// Usar las rutas importadas con prefijos de API
app.use('/api/productos', productRoutes);
app.use('/api/company-info', companyInfoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);

// Ruta para manejar HTML5 History Mode (para SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'angular-frontend/dist/angular-frontend/browser', 'index.html'));
});

// --- Iniciar el servidor ---
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
