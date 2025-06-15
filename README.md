# Floristería Laurita - Catálogo Web

Plataforma web completa para la Floristería Laurita, que permite a los usuarios explorar productos, realizar compras y más. Este proyecto está desarrollado utilizando la pila MEAN.

## Tabla de Contenidos

- [Introducción a la pila MEAN](#introducción-a-la-pila-mean)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Estructura de carpetas y archivos](#estructura-de-carpetas-y-archivos)
- [Guía de instalación y puesta en marcha](#guía-de-instalación-y-puesta-en-marcha)
- [Autores y crédito](#autores-y-crédito)

## Introducción a la pila MEAN

La pila **MEAN** es un acrónimo de **M**ongoDB, **E**xpress.js, **A**ngular y **N**ode.js. Es un conjunto de tecnologías basadas en JavaScript de código abierto que se utilizan para construir aplicaciones web complejas y escalables. Se eligió para este proyecto por su cohesión (JavaScript en todo el stack), su activa comunidad y la eficiencia en el desarrollo de aplicaciones modernas de una sola página (SPA).

Roles de cada componente:

-   **MongoDB**: Es una base de datos NoSQL orientada a documentos. Almacena los datos en formato BSON (similar a JSON), lo que facilita la integración con aplicaciones JavaScript. Ideal para datos flexibles y escalabilidad horizontal.
-   **Express.js**: Es un framework minimalista y flexible para Node.js, diseñado para construir aplicaciones web y APIs RESTful de manera rápida y sencilla. Proporciona una capa robusta de funcionalidades web básicas.
-   **Angular**: Es un framework de desarrollo frontend mantenido por Google, utilizado para construir aplicaciones web dinámicas y de una sola página (SPA). Emplea TypeScript y ofrece una estructura completa para componentes, routing y gestión de estado.
-   **Node.js**: Es un entorno de ejecución de JavaScript del lado del servidor, construido sobre el motor V8 de Chrome. Permite ejecutar JavaScript fuera del navegador, siendo la base para el backend de la aplicación y herramientas de desarrollo.

## Arquitectura del proyecto

La aplicación sigue una arquitectura de N-capas, comúnmente vista en aplicaciones MEAN:

```text
+-----------------+      +---------------------+      +-----------------+
|   Cliente       |----->|    Servidor API     |<---->|  Base de Datos  |
|  (Angular)      |      | (Node.js/Express)   |      |   (MongoDB)     |
|  - Interfaz UI  |      | - Lógica Negocio    |      | - Persistencia  |
|  - Navegador Web|      | - Endpoints RESTful |      | - Colecciones   |
+-----------------+      +---------------------+      +-----------------+
       ^ (HTTP/S, JSON)           | (JSON)
       |                          |
+----------------------------------+
| Usuario                          |
+----------------------------------+
```

**Comunicación entre capas**:
-   El frontend (Angular) se comunica con el backend (Express.js) a través de peticiones HTTP/S, siguiendo principios RESTful. Los datos se intercambian principalmente en formato JSON.
-   El backend interactúa con la base de datos MongoDB mediante un ODM (Object Document Mapper) como Mongoose.

**Patrones y principios clave**:
-   **RESTful API**: Diseño de la API para una comunicación estándar y predecible.
-   **MVC (Model-View-Controller)**: Aunque Express es flexible, se sigue una estructura similar en el backend (Modelos, Rutas como Controladores, Vistas gestionadas por Angular).
-   **Inyección de Dependencias (DI)**: Utilizada extensivamente en Angular para gestionar servicios y componentes.
-   **Servicios**: En Angular, los servicios encapsulan la lógica de negocio y la comunicación con la API.
-   **Middleware**: En Express, se utilizan para funciones transversales como autenticación, logging y manejo de errores.

## Estructura de carpetas y archivos

A continuación, se presenta un resumen de la estructura de carpetas más relevantes del proyecto (máximo 2 niveles de profundidad):

```
/T2.floristeriaLauritaAngular/
├── angular-frontend/        # Proyecto Frontend (Angular)
│   ├── src/                 # Código fuente principal del frontend (componentes, servicios, etc.)
│   └── ...                  # Otros archivos de configuración de Angular (angular.json, tsconfig.json)
├── backend/                 # Proyecto Backend (Node.js/Express)
│   ├── controllers/         # Lógica de negocio y manejo de peticiones API
│   ├── models/              # Esquemas de datos para MongoDB (usando Mongoose)
│   ├── routes/              # Definición de las rutas (endpoints) de la API
│   ├── middleware/          # Funciones middleware (autenticación, validación, errores)
│   └── config/              # Archivos de configuración (BD, seguridad)
├── app.js                   # Archivo principal de configuración de la aplicación Express (backend)
├── server.js                # Script para iniciar el servidor backend y conectar a la BD
├── .env.example             # Plantilla para las variables de entorno necesarias
├── package.json             # Dependencias y scripts del proyecto (nivel raíz y backend)
└── README.md                # Este archivo de documentación
```

**Responsabilidades principales**:
-   `angular-frontend/`: Contiene toda la lógica y componentes de la interfaz de usuario que se ejecuta en el navegador.
    -   `angular-frontend/src/app/`: Núcleo de la aplicación Angular (módulos, componentes, servicios, modelos).
-   `backend/`: Alberga el código del servidor que maneja la lógica de negocio, la API y la interacción con la base de datos.
    -   `backend/controllers/`: Procesan las solicitudes entrantes, interactúan con los modelos y envían respuestas.
    -   `backend/models/`: Definen la estructura de los datos que se almacenan en MongoDB.
    -   `backend/routes/`: Asocian los endpoints de la API con sus respectivos controladores.
-   `app.js`: Configura la instancia de Express, incluyendo middlewares, rutas y manejo de errores.
-   `server.js`: Inicia el servidor HTTP y establece la conexión con MongoDB.

## Guía de instalación y puesta en marcha

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### Requisitos Previos

-   **Node.js**: Versión `>=18.x` (incluye npm). Se recomienda la última versión LTS.
-   **Angular CLI**: Versión `~19.2.9` (según `angular-frontend/package.json`). Instalar globalmente con `npm install -g @angular/cli@~19.2.9`.
-   **MongoDB**: Versión `>=5.x`. Asegúrate de tener una instancia de MongoDB en ejecución (local o en la nube como MongoDB Atlas).

### Pasos de Instalación

1.  **Clonar el repositorio** (si aún no lo has hecho):
    ```bash
    git clone https://github.com/EstivenUribe/T2.floristeriaLauritaAngular.git
    cd T2.floristeriaLauritaAngular
    ```

2.  **Instalar dependencias**:
    Este proyecto tiene dependencias separadas para el backend (en la raíz) y el frontend.
    ```bash
    # Instalar dependencias del backend y herramientas generales (desde la raíz del proyecto)
    npm install

    # Instalar dependencias del frontend
    cd angular-frontend
    npm install
    cd ..
    ```
    Alternativamente, el script `npm run install` (desde la raíz) intenta instalar ambas (revisar su correcta implementación en `package.json`).

3.  **Configurar Variables de Entorno**:
    Copia el archivo `.env.example` a un nuevo archivo llamado `.env` en la raíz del proyecto:
    ```bash
    cp .env.example .env
    ```
    Luego, edita `.env` y configura las variables necesarias. Las más importantes son:

    | Variable        | Descripción                                  | Ejemplo                                      |
    |-----------------|----------------------------------------------|----------------------------------------------|
    | `MONGODB_URI`   | URI de conexión a MongoDB                    | `mongodb://127.0.0.1:27017/floristeriaLaurita` |
    | `PORT`          | Puerto para el servidor Express              | `3000`                                       |
    | `NODE_ENV`      | Entorno de ejecución (`development`/`production`) | `development`                                |
    | `CORS_ORIGIN`   | Origen permitido para CORS (URL frontend)    | `http://localhost:4200`                      |
    | `JWT_SECRET`    | Secreto para firmar los JSON Web Tokens      | `tu_secreto_muy_seguro_aqui`                 |
    | `REFRESH_TOKEN_SECRET` | Secreto para los refresh tokens       | `otro_secreto_muy_seguro_aqui_ref`           |
    *Nota: Revisa `.env.example` para todas las variables disponibles.*

4.  **Scripts Útiles (ejecutar desde la raíz del proyecto)**:

    -   **Modo desarrollo (backend y frontend simultáneamente)**:
        ```bash
        npm run dev:both
        ```
        Esto iniciará el servidor backend con `nodemon` y el servidor de desarrollo de Angular. El backend estará en `http://localhost:PORT` (ej. 3000) y el frontend en `http://localhost:4200`.

    -   **Solo backend (modo desarrollo)**:
        ```bash
        npm run dev 
        ```
        (Nota: el script en `package.json` es `dev`, no `dev:backend` como se mencionó antes en el README original. `dev` ejecuta `nodemon server.js`)

    -   **Solo frontend (servidor de desarrollo Angular)**:
        ```bash
        cd angular-frontend
        npm start
        ```

    -   **Compilar frontend para producción**:
        ```bash
        npm run build
        ```
        Esto genera los archivos compilados en `angular-frontend/dist/angular-frontend/browser/` (la ruta puede variar según la versión de Angular y configuración).

    -   **Ejecutar en modo producción (backend sirviendo frontend compilado)**:
        ```bash
        npm run prod
        ```
        Este script ejecuta `npm run build && npm start` (el `npm start` de la raíz, que ejecuta `node server.js`).

### Ejecutar Pruebas y Linters

-   **Pruebas del Frontend (Angular)**:
    ```bash
    cd angular-frontend
    npm test
    ```
-   **Linters**: (Próximamente) Si se configuran linters como ESLint para el backend o TSLint/ESLint para el frontend, aquí se detallarán los comandos.

### Despliegue

-   **Local**: Utiliza `npm run prod` para simular un entorno de producción local donde Node.js sirve los archivos estáticos de Angular ya compilados.
-   **Producción (Generalidades)**: Para desplegar en plataformas como Vercel (ideal para frontends Angular), Heroku, AWS (EC2, Elastic Beanstalk), Google Cloud (App Engine, Cloud Run), o usando Docker:
    1.  Asegúrate que el backend (`app.js` o `server.js`) esté configurado para servir los archivos estáticos del frontend desde la carpeta de compilación (ej. `angular-frontend/dist/...`).
    2.  Configura las variables de entorno en la plataforma de despliegue.
    3.  Considera un `Dockerfile` para empaquetar la aplicación si usas contenedores.
    4.  Utiliza un gestor de procesos como PM2 en servidores VPS/EC2 para mantener la aplicación Node.js corriendo.

Para una guía de instalación más detallada que podría existir en el proyecto, consulta [INSTALACION.md](./INSTALACION.md).

## Autores y Crédito

Este proyecto fue desarrollado como parte de la asignatura de Taller 2 por:

-   Sebastián González
-   Juan Camilo Ossa Lujan
-   Rafael Uribe Álvarez

*(Se pueden añadir roles y enlaces a perfiles si se desea, por ejemplo:)*
-   *Sebastián González - Desarrollador Fullstack - [GitHub](https://github.com/SbtnGzlz)*
-   *Juan Camilo Ossa Lujan - Desarrollador Fullstack - [GitHub](https://github.com/JC4701)*
-   *Rafael Uribe Álvarez - Líder de despligue e infraestructura / Fullstack - [GitHub](https://github.com/EstivenUribe)*

### Reconocimientos

-   A las comunidades y desarrolladores de Angular, Node.js, Express, MongoDB por sus frameworks, librerías y documentación.
-  A cualquier librería de terceros crucial para el proyecto (ej. Swiper, Nodemailer, etc.).

---
*Este README ha sido actualizado y estructurado para cumplir con los requisitos del proyecto.*