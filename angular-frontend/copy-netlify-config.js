const fs = require('fs');
const path = require('path');

// Ruta al archivo netlify.toml en la carpeta public
const sourcePath = path.join(__dirname, 'public', 'netlify.toml');

// Ruta de destino en la carpeta dist/angular-frontend
const destPath = path.join(__dirname, 'dist', 'angular-frontend', 'netlify.toml');

// Crear el directorio de destino si no existe
const destDir = path.dirname(destPath);
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copiar el archivo
fs.copyFileSync(sourcePath, destPath);

console.log(`Archivo netlify.toml copiado a ${destPath}`);
