// Script para crear imágenes de ejemplo para el proyecto
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Lista de imágenes requeridas
const requiredImages = [
  { 
    name: 'Logo.png', 
    width: 200, 
    height: 100, 
    type: 'logo',
    text: 'Floristería Laurita' 
  },
  { 
    name: 'hero-banner.jpg', 
    width: 1200, 
    height: 500, 
    type: 'banner',
    text: 'Bienvenido a Floristería Laurita' 
  },
  { 
    name: 'categories/anniversary.jpg', 
    width: 400, 
    height: 300, 
    type: 'category',
    text: 'Aniversarios' 
  },
  { 
    name: 'categories/birthday.jpg', 
    width: 400, 
    height: 300, 
    type: 'category',
    text: 'Cumpleaños' 
  },
  { 
    name: 'categories/wedding.jpg', 
    width: 400, 
    height: 300, 
    type: 'category',
    text: 'Bodas' 
  },
  { 
    name: 'categories/sympathy.jpg', 
    width: 400, 
    height: 300, 
    type: 'category',
    text: 'Condolencias' 
  },
  { 
    name: 'products/product1.jpg', 
    width: 500, 
    height: 500, 
    type: 'product',
    text: 'Ramo de Rosas Rojas' 
  },
  { 
    name: 'products/product2.jpg', 
    width: 500, 
    height: 500, 
    type: 'product',
    text: 'Orquídea Phalaenopsis' 
  },
  { 
    name: 'icons/google-logo.png', 
    width: 80, 
    height: 30, 
    type: 'icon',
    text: 'Google' 
  }
];

// Función para crear una imagen de ejemplo
async function createPlaceholderImage(imageInfo) {
  const { name, width, height, type, text } = imageInfo;
  
  // Crear el canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Definir colores según el tipo de imagen
  let bgColor, textColor;
  switch (type) {
    case 'logo':
      bgColor = '#ffffff';
      textColor = '#663399';
      break;
    case 'banner':
      bgColor = '#f0e6ff';
      textColor = '#4a148c';
      break;
    case 'category':
      bgColor = '#e1f5fe';
      textColor = '#01579b';
      break;
    case 'product':
      bgColor = '#e8f5e9';
      textColor = '#1b5e20';
      break;
    case 'icon':
      bgColor = '#ffffff';
      textColor = '#4285f4';
      break;
    default:
      bgColor = '#f5f5f5';
      textColor = '#333333';
  }
  
  // Dibujar fondo
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);
  
  // Dibujar borde
  ctx.strokeStyle = textColor;
  ctx.lineWidth = Math.max(2, width / 100);
  ctx.strokeRect(10, 10, width - 20, height - 20);
  
  // Dibujar texto
  ctx.fillStyle = textColor;
  const fontSize = Math.max(16, Math.min(width / 10, height / 5));
  ctx.font = \`bold \${fontSize}px Arial\`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Ajustar texto si es demasiado largo
  let displayText = text;
  let metrics = ctx.measureText(displayText);
  if (metrics.width > width - 40) {
    // Dividir en líneas
    const words = text.split(' ');
    let line1 = '';
    let line2 = '';
    
    for (const word of words) {
      if (ctx.measureText(line1 + ' ' + word).width <= width - 40) {
        line1 += (line1 ? ' ' : '') + word;
      } else {
        line2 += (line2 ? ' ' : '') + word;
      }
    }
    
    ctx.fillText(line1, width / 2, height / 2 - fontSize * 0.6);
    ctx.fillText(line2, width / 2, height / 2 + fontSize * 0.6);
  } else {
    ctx.fillText(displayText, width / 2, height / 2);
  }
  
  // Añadir detalles según el tipo
  if (type === 'product' || type === 'category') {
    // Añadir flores estilizadas en las esquinas
    drawStylizedFlower(ctx, 40, 40, 30, textColor);
    drawStylizedFlower(ctx, width - 40, 40, 30, textColor);
    drawStylizedFlower(ctx, 40, height - 40, 30, textColor);
    drawStylizedFlower(ctx, width - 40, height - 40, 30, textColor);
  }
  
  if (type === 'logo') {
    // Añadir detalle de flor en el logo
    drawFancyFlower(ctx, width / 2 - 50, height / 2, 30, '#ff69b4');
  }
  
  // Guardar la imagen
  const filePath = path.join(__dirname, name);
  const dir = path.dirname(filePath);
  
  // Crear directorio si no existe
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Determinar el formato correcto
  const format = name.endsWith('.png') ? 'png' : 'jpeg';
  const buffer = format === 'png' ? canvas.toBuffer('image/png') : canvas.toBuffer('image/jpeg');
  
  fs.writeFileSync(filePath, buffer);
  console.log(\`Imagen creada: \${name}\`);
}

// Función para dibujar una flor estilizada
function drawStylizedFlower(ctx, x, y, size, color) {
  // Pétalos
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(angle) * size / 2,
      y + Math.sin(angle) * size / 2,
      size / 3,
      size / 1.5,
      angle,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  
  // Centro
  ctx.beginPath();
  ctx.arc(x, y, size / 3, 0, Math.PI * 2);
  ctx.fillStyle = '#ffdd00';
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

// Función para dibujar una flor más elaborada para el logo
function drawFancyFlower(ctx, x, y, size, color) {
  // Tallo
  ctx.beginPath();
  ctx.moveTo(x, y + size);
  ctx.quadraticCurveTo(x - 10, y + size / 2, x, y - size);
  ctx.strokeStyle = '#4CAF50';
  ctx.lineWidth = size / 10;
  ctx.stroke();
  
  // Hoja
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x - size, y + size / 2, x, y + size);
  ctx.fillStyle = '#4CAF50';
  ctx.fill();
  
  // Flor
  ctx.beginPath();
  ctx.arc(x, y - size, size, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  
  // Detalles de la flor
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(angle) * size / 2,
      y - size + Math.sin(angle) * size / 2,
      size / 3,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }
}

// Función principal
async function createAllPlaceholders() {
  console.log('Creando imágenes de marcador de posición...');
  
  for (const imageInfo of requiredImages) {
    await createPlaceholderImage(imageInfo);
  }
  
  console.log('Todas las imágenes de marcador de posición han sido creadas.');
  console.log('Nota: Para entorno de producción, reemplaza estas imágenes con contenido real.');
}

// Intentar crear las imágenes directamente
try {
  console.log('Este script requiere el paquete "canvas". Si ves un error, instálalo con:');
  console.log('npm install canvas --save-dev');
  
  // Crear un HTML alternativo que liste las imágenes requeridas
  let html = `
<!DOCTYPE html>
<html>
<head>
  <title>Imágenes Requeridas</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    ul { list-style-type: none; padding: 0; }
    li { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>Imágenes Requeridas para el Proyecto</h1>
  <p>Para resolver los errores 404, necesitas crear o añadir las siguientes imágenes:</p>
  <ul>
`;

  requiredImages.forEach(img => {
    html += `    <li>${img.name} - ${img.width}x${img.height} - ${img.text}</li>\n`;
  });

  html += `
  </ul>
  <p>Puedes usar el generador de marcadores de posición (placeholder-generator.html) para crear estas imágenes.</p>
</body>
</html>
  `;

  fs.writeFileSync(path.join(__dirname, 'required-images.html'), html);
  console.log('Lista de imágenes requeridas creada en required-images.html');
  
  // Si está disponible el módulo canvas, crear las imágenes
  try {
    createAllPlaceholders();
  } catch (e) {
    console.log('No se pudieron crear automáticamente las imágenes. Por favor:');
    console.log('1. Instala el paquete canvas: npm install canvas --save-dev');
    console.log('2. O utiliza el generador HTML para crear manualmente las imágenes.');
  }
} catch (error) {
  console.error('Error:', error.message);
}