# Guía de imágenes para Floristería Laurita

## Imágenes faltantes

Hemos detectado que la aplicación requiere las siguientes imágenes:

1. `Logo.png` - Logo de la floristería
2. `assets/images/hero-banner.jpg` - Banner para la página principal
3. `assets/images/categories/anniversary.jpg` - Imagen para categoría de aniversario
4. `assets/images/categories/birthday.jpg` - Imagen para categoría de cumpleaños
5. `assets/images/categories/wedding.jpg` - Imagen para categoría de bodas
6. `assets/images/categories/sympathy.jpg` - Imagen para categoría de condolencias
7. `assets/images/products/product1.jpg` - Imagen para el primer producto (Ramo de Rosas)
8. `assets/images/products/product2.jpg` - Imagen para el segundo producto (Orquídea)
9. `assets/images/icons/google-logo.png` - Logo de Google para inicio de sesión

## Cómo generar las imágenes

1. Hemos preparado un generador HTML de imágenes de marcador de posición en:
   - `assets/images/placeholder-images.html`

2. Abre este archivo en tu navegador y:
   - Verás previsualizaciones de todas las imágenes requeridas
   - Puedes personalizar las imágenes si lo deseas
   - Descarga cada imagen usando los botones "Descargar"
   - Coloca cada imagen en la ubicación correcta

3. Para producción:
   - Reemplaza estas imágenes de marcador de posición con imágenes de alta calidad

## Estructura de directorios

```
assets/
├── images/
│   ├── categories/
│   │   ├── anniversary.jpg
│   │   ├── birthday.jpg
│   │   ├── wedding.jpg
│   │   └── sympathy.jpg
│   ├── products/
│   │   ├── product1.jpg
│   │   └── product2.jpg
│   ├── icons/
│   │   └── google-logo.png
│   └── hero-banner.jpg
└── Logo.png
```

Para resolver los errores 404, asegúrate de que todas estas imágenes estén presentes en las rutas especificadas.