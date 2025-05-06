const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Importar rutas
const productRoutes = require('./routes/products');
const companyInfoRoutes = require('./routes/companyInfo');
const uploadRoutes = require('./routes/uploads');
const teamRoutes = require('./routes/team');
const bannerRoutes = require('./routes/banners');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de la base de datos
const dbConfig = require('./config/db');
mongoose.connect(dbConfig.url)
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error de conexión a MongoDB:', err));

// Servir archivos estáticos de la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas API
app.use('/api/productos', productRoutes);
app.use('/api/company-info', companyInfoRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/banners', bannerRoutes);

// Servir el frontend de Angular en producción
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist/frontend')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist/frontend/index.html'));
    });
} else {
    // En desarrollo, servir los archivos estáticos para pruebas
    app.use(express.static(path.join(__dirname, '../public')));
}

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});