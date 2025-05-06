# Floristería Laurita - Catálogo Web

Plataforma web completa para la Floristería Laurita en Sabaneta, Colombia. Permite a los usuarios ver productos, realizar compras, dejar comentarios y calificaciones.

## Estructura del Proyecto

```
/floristeria-laurita/
├── angular-frontend/        # Frontend en Angular
│   └── ...
├── backend/
│   ├── controllers/         # Controladores para las rutas API
│   ├── middleware/          # Middleware (auth, etc.)
│   ├── models/              # Modelos de datos (MongoDB/Mongoose)
│   └── routes/              # Rutas API
├── server.js                # Punto de entrada del servidor Express
└── package.json             # Dependencias y scripts del proyecto
```

## Características

- **Catálogo de Productos**: Visualización y búsqueda de flores y arreglos florales
- **Sistema de Usuarios**: Registro, inicio de sesión y roles (cliente/administrador)
- **Carrito de Compras**: Añadir productos, gestionar cantidades, procesar pedidos
- **Reseñas y Calificaciones**: Los usuarios pueden dejar comentarios y valoraciones
- **Panel de Administración**: Gestión de productos, pedidos y comentarios
- **Diseño Responsivo**: Adaptable a diferentes dispositivos

## Tecnologías Utilizadas

- **Frontend**: Angular, Angular Router, RxJS, Swiper
- **Backend**: Node.js, Express
- **Base de Datos**: MongoDB con Mongoose
- **Autenticación**: JWT (JSON Web Tokens)

## Cómo Ejecutar

1. **Instalación de dependencias**
   ```
   npm run install
   ```

2. **Modo desarrollo** (ejecuta backend y frontend simultáneamente)
   ```
   npm run dev
   ```

3. **Producción**
   ```
   npm run prod
   ```

## Desarrollo

- **Puerto Backend**: 3000
- **Puerto Frontend**: 4200 (en desarrollo)
- **API Base URL**: http://localhost:3000/api

## Autores

Proyecto desarrollado para la asignatura de Taller 2.