# Floristería Laurita - Catálogo Web

Plataforma web completa para la Floristería Laurita en Sabaneta, Colombia. Permite a los usuarios ver productos, realizar compras, dejar comentarios y calificaciones.

## Descripción General del Proyecto

Este proyecto implementa una aplicación web completa para una floristería, con un catálogo de productos, sistema de usuarios, carrito de compras, reseñas y panel de administración. La aplicación está diseñada con una arquitectura de tres capas:

1. **Frontend**: Interfaz de usuario desarrollada con Angular
2. **Backend**: API RESTful desarrollada con Express
3. **Base de Datos**: MongoDB para almacenamiento persistente

## Características Principales

- **Catálogo de Productos**: Visualización y búsqueda de flores y arreglos florales
- **Sistema de Usuarios**: Registro, inicio de sesión y roles (cliente/administrador)
- **Carrito de Compras**: Añadir productos, gestionar cantidades, procesar pedidos
- **Reseñas y Calificaciones**: Los usuarios pueden dejar comentarios y valoraciones
- **Panel de Administración**: Gestión de productos, pedidos y comentarios
- **Diseño Responsivo**: Adaptable a diferentes dispositivos
- **Sistema de Caché**: Optimización de rendimiento para archivos estáticos
- **Manejo de Sesiones**: Autenticación segura con JWT
- **Gestión de Imágenes**: Carga y optimización de imágenes de productos

## Estructura del Proyecto

```
/T2.floristeriaLauritaAngular/
├── angular-frontend/        # Frontend en Angular
│   ├── src/                 # Código fuente del frontend
│   │   ├── app/            
│   │   │   ├── components/  # Componentes de la interfaz
│   │   │   ├── services/    # Servicios para comunicación con API
│   │   │   ├── models/      # Modelos de datos
│   │   │   ├── guards/      # Guardias de rutas
│   │   │   └── interceptors/# Interceptores HTTP
│   │   ├── assets/          # Recursos estáticos
│   │   └── ...
│   ├── vite.config.js       # Configuración del servidor de desarrollo
│   └── ...
├── backend/
│   ├── config/              # Configuración (base de datos, etc.)
│   ├── controllers/         # Controladores para las rutas API
│   ├── middleware/          # Middleware (auth, uploads, etc.)
│   ├── models/              # Modelos de datos (MongoDB/Mongoose)
│   ├── routes/              # Rutas API
│   └── uploads/             # Directorio para archivos subidos
├── app.js                   # Configuración de la aplicación Express
├── server.js                # Inicialización del servidor y BD
├── index.js                 # Punto de entrada principal
├── test-db-connection.js    # Script para probar conexiones a BD
├── .env.example             # Ejemplo de variables de entorno
├── INSTALACION.md           # Guía detallada de instalación
└── package.json             # Dependencias y scripts del proyecto
```

## Tecnologías Utilizadas

### Frontend
- **Angular**: Framework de desarrollo frontend
- **RxJS**: Biblioteca para programación reactiva
- **Vite**: Servidor de desarrollo rápido

### Backend
- **Node.js**: Entorno de ejecución para JavaScript
- **Express**: Framework para aplicaciones web
- **Mongoose**: ODM para MongoDB
- **JSON Web Tokens (JWT)**: Autenticación basada en tokens
- **Multer**: Manejo de uploads de archivos

### Seguridad y Optimización
- **Helmet**: Protección con cabeceras HTTP
- **CORS**: Control de acceso entre dominios
- **Compression**: Compresión de respuestas HTTP
- **Rate Limiting**: Limitación de solicitudes
- **Content Security Policy**: Protección contra ataques XSS

### Base de Datos
- **MongoDB Atlas**: Servicio de base de datos en la nube
- **MongoDB Local**: Opción de fallback para desarrollo

### Herramientas de Desarrollo
- **ESLint**: Linting de código
- **Nodemon**: Reinicio automático del servidor durante desarrollo

## Instalación y Ejecución

Para detalles completos sobre la instalación y ejecución del proyecto, consulta [INSTALACION.md](./INSTALACION.md).

### Comandos Principales

```bash
# Instalación de dependencias
npm install

# Modo desarrollo (backend y frontend)
npm run dev

# Solo backend
npm run dev:backend

# Producción
npm run prod
```

## Variables de Entorno

La aplicación utiliza las siguientes variables de entorno:

| Variable | Descripción | Valor por defecto |
|----------|-------------|------------------|
| `MONGODB_URI` | URI de conexión a MongoDB Atlas | - |
| `PORT` | Puerto para el servidor Express | 3000 |
| `NODE_ENV` | Entorno de ejecución | development |
| `CORS_ORIGIN` | Origen permitido para CORS | http://localhost:4200 |
| `STANDALONE` | Iniciar Angular automáticamente | false |

## Características Técnicas Adicionales

### Gestión de Conexión a MongoDB
- Conexión primaria a MongoDB Atlas con fallback a MongoDB local
- Manejo automático de reconexión
- Validación de URI de conexión

### Sistema de Proxy
- Configuración de proxy en modo desarrollo para evitar problemas CORS
- Forwarding de todas las solicitudes `/api/*` al backend

### Optimización de Rendimiento
- Compresión de respuestas HTTP
- Caché inteligente basada en tipo de archivo
- Configuración de etags para recursos estáticos

### Manejo de Errores
- Errores personalizados para problemas de conexión a la BD
- Modo de operación limitada cuando la BD no está disponible
- Logging detallado de errores

## Licencia y Contribuciones

Este proyecto está bajo licencia MIT. Si deseas contribuir:

1. Haz un fork del repositorio
2. Crea una rama con tu nueva funcionalidad
3. Envía un pull request con tus cambios

## Autores

Proyecto desarrollado para la asignatura de Taller 2 por los estudiantes de Ingeniría informática:
 -Sebastián González
 -Juan Camilo Ossa Lujan
 -Rafael Uribe Álvarez