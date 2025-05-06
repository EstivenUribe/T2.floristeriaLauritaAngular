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

2. **Modo desarrollo** (ejecuta solo el backend con recarga automática)
   ```
   npm run dev
   ```

3. **Modo frontend** (ejecuta el servidor de desarrollo de Angular)
   ```
   npm run dev:frontend
   ```

4. **Modo completo** (ejecuta backend y frontend simultáneamente)
   ```
   npm run dev:both
   ```

5. **Producción**
   ```
   npm run prod
   ```

## Desarrollo

- **Puerto Backend**: 3000
- **Puerto Frontend**: 4200 (en desarrollo)
- **API Base URL**: http://localhost:3000/api

## Solución de Problemas

### Error con MongoDB
Si el backend no puede conectarse a MongoDB, debes verificar:
- Que las credenciales de MongoDB sean correctas
- Que tengas conexión a internet
- Que la IP desde la que te conectas esté permitida en MongoDB Atlas

### Error con Rutas o Controladores
Si aparece un error como "Route requires a callback function but got undefined":
- Verifica que todos los controladores estén correctamente implementados
- Comprueba que las importaciones de los controladores sean correctas

### Error con Uploads
Si tienes problemas con la carga de archivos:
- Asegúrate de que existan las carpetas de uploads en el backend
- Verifica los permisos de escritura en esas carpetas

## Autores

Proyecto desarrollado para la asignatura de Taller 2.