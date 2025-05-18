const mongoose = require('mongoose');

const valorSchema = new mongoose.Schema({
    titulo: String,
    descripcion: String,
    icono: String // Asumiendo que el ícono es una clase de Font Awesome o similar
});

const companyInfoSchema = new mongoose.Schema({
    mision: String,
    vision: String,
    historiaTitulo: String,             
    historiaTexto: String,              
    historiaImagenUrl: String,          
    valores: [valorSchema],             
    integrantes: [{                     // Este campo se puede mantener o quitar si se gestiona totalmente por separado
        nombre: String,
        apellido: String
        // Otros campos de integrantes si los tienes
    }]
}, { timestamps: true }); // Es buena práctica añadir timestamps

module.exports = mongoose.model('CompanyInfo', companyInfoSchema);