const mongoose = require('mongoose');

const variationOptionSchema = new mongoose.Schema({
    valor: { type: String, required: true },
    selected: { type: Boolean, default: false }
}, { _id: false });

const variationSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    opciones: [variationOptionSchema]
}, { _id: false });

const productoSchema = new mongoose.Schema({
    nombre: { type: String, required: true, index: true },
    descripcion: { type: String, default: '' },
    imagen: { type: String, default: '' },
    precio: { type: Number, required: true, min: 0, index: true },
    rebaja: { type: Boolean, default: false, index: true },
    descuento: { type: Number, min: 0, max: 100, default: 0 },
    categoria: { type: String, index: true },
    tags: [{ type: String, index: true }],
    disponible: { type: Boolean, default: true, index: true },
    destacado: { type: Boolean, default: false, index: true },
    variaciones: [variationSchema],
    fechaCreacion: { type: Date, default: Date.now, index: true }
}, {
    timestamps: true, // Añade createdAt y updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual para precio con descuento
productoSchema.virtual('precioFinal').get(function() {
    if (this.rebaja && this.descuento > 0) {
        return this.precio * (1 - this.descuento / 100);
    }
    return this.precio;
});

// Método estático para obtener todas las categorías disponibles
productoSchema.statics.getCategorias = async function() {
    return this.distinct('categoria').exec();
};

// Índice compuesto para búsquedas frecuentes
productoSchema.index({ destacado: 1, disponible: 1 });
productoSchema.index({ rebaja: 1, disponible: 1 });
productoSchema.index({ categoria: 1, disponible: 1 });

// Optimización para búsquedas de texto
productoSchema.index({ nombre: 'text', descripcion: 'text', categoria: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productoSchema); // 'Product' será el nombre de la colección (en plural 'products' por convención)
