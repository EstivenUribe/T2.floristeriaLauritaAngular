# Instrucciones de Instalación y Ejecución - Floristería Laurita

Esta guía detalla los pasos necesarios para instalar y ejecutar el proyecto de Floristería Laurita en cualquier portátil.

## Requisitos del Sistema

- **Node.js**: Versión 16.x o superior
- **MongoDB**: 
  - Opción 1: Cuenta en MongoDB Atlas (recomendado para producción)
  - Opción 2: MongoDB instalado localmente (versión 4.4+)
- **npm**: Versión 6.x o superior
- **Navegador web moderno**: Chrome, Firefox, Edge, etc.

## Instalación de Dependencias

1. Clona el repositorio:

```bash
git clone https://github.com/EstivenUribe/T2.floristeriaLauritaAngular.git
cd T2.floristeriaLauritaAngular
```

2. Instala todas las dependencias (backend y frontend):

```bash
npm install
```

Este comando ejecutará automáticamente la instalación de dependencias para ambos proyectos.

## Configuración de Variables de Entorno

1. Crea un archivo `.env` en la raíz del proyecto basado en el archivo `.env.example`:

```bash
cp .env.example .env
```

2. Edita el archivo `.env` con tus propias credenciales:

```
# MongoDB Configuration
# Formato: mongodb+srv://<usuario>:<contraseña>@<cluster-url>/<nombre-base-datos>?retryWrites=true&w=majority
MONGODB_URI=mongodb+srv://MongodbPrueba:asdfqwer1234@parcial.a6gbmrh.mongodb.net/?retryWrites=true&w=majority&appName=Parcial

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:4200

# Angular Development Mode
STANDALONE=false
```

> **IMPORTANTE**: Asegúrate de incluir el nombre de la base de datos (`floristeria`) en la URI de MongoDB.

## Inicio de la Aplicación

### Modo de Desarrollo

Para iniciar la aplicación en modo desarrollo con reinicio automático:

```bash
npm run dev
```

Para iniciar la aplicacion de forma completa:

```bash
npm run dev:both
```

Este comando:
1. Inicia el servidor backend con nodemon
2. Espera a que el servidor se inicie y se conecte a MongoDB
3. Una vez el servidor está listo, inicia el servidor de desarrollo de Angular

Si necesitas ejecutar solo el backend:

```bash
npm run dev:backend
```

Para el frontend independientemente:

```bash
cd angular-frontend
npm start
```

### Modo de Producción

Para compilar el frontend y ejecutar en modo producción:

```bash
npm run prod
```

Este comando compila el frontend y lo sirve desde el servidor Express.

Alternativamente, puedes compilar el frontend y luego iniciar el servidor:

```bash
cd angular-frontend
npm run build

```

## Verificación de la Instalación

1. Abre el navegador y accede a http://localhost:4200 (desarrollo) o http://localhost:3000 (producción)

2. Verifica que la página principal de la floristería se carga correctamente

3. Prueba los endpoints de la API:
   - http://localhost:3000/api/productos (debería devolver una lista de productos)
   - http://localhost:3000/api/company-info (debería devolver información de la empresa)

## Solución de Problemas Comunes

### Problemas de Conexión a MongoDB

1. **Error de Conexión a Atlas**:
   - Verifica que la URI de MongoDB es correcta y tiene el formato adecuado
   - Asegúrate de que la IP desde la que te conectas está en la lista blanca de Atlas
   - Comprueba que el usuario y contraseña son correctos
   - La aplicación intentará conectarse automáticamente a MongoDB local si Atlas falla

2. **Error de Conexión Local**:
   - Verifica que MongoDB esté instalado y ejecutándose localmente
   - Comprueba con `mongosh` o `mongo` si puedes conectarte a `mongodb://localhost:27017`
   - Si no tienes MongoDB instalado localmente y Atlas falla, instala MongoDB o corrige los problemas de conexión a Atlas

### Problemas de Proxy en Desarrollo

1. **Errores 404 en Llamadas a la API desde Angular**:
   - Asegúrate de que el backend está ejecutándose en el puerto 3000
   - Verifica que el archivo `vite.config.js` tiene configurado correctamente el proxy:
     ```js
     proxy: {
       '/api': {
         target: 'http://localhost:3000',
         changeOrigin: true,
         secure: false
       }
     }
     ```
   - Reinicia tanto el frontend como el backend

### Conflictos de Puerto

1. **Puerto 3000 o 4200 en Uso**:
   - Cambia el puerto del backend en el archivo `.env` (variable `PORT`)
   - Para cambiar el puerto del frontend, modifica `vite.config.js` y ajusta el valor de `server.port`
   - Si cambias el puerto del backend, recuerda actualizar también la configuración del proxy

### Problemas de Rendimiento

1. **Carga Lenta de Imágenes**:
   - Verifica que las carpetas `/backend/uploads/products`, `/backend/uploads/team` y `/backend/uploads/banners` existen
   - Comprueba los permisos de escritura en estas carpetas

2. **Timeout en MongoDB**:
   - La configuración ha sido optimizada para manejar timeouts, pero si persisten, verifica tu conexión a Internet
   - Aumenta los valores de `serverSelectionTimeoutMS` y `connectTimeoutMS` en `backend/config/db.js` si es necesario

### Versión Compilada No Actualizada

Si los cambios no aparecen en la versión compilada:
1. Ejecuta `npm run build` para recompilar el frontend
2. Reinicia el servidor con `npm start`

## Probando la Conexión a la Base de Datos

La aplicación incluye un script para probar las conexiones a la base de datos:

```bash
node test-db-connection.js
```

Este script intentará conectarse a:
1. MongoDB Atlas usando la URI configurada
2. MongoDB local
3. Probar el mecanismo de fallback

El resultado mostrará qué conexiones funcionan correctamente.
