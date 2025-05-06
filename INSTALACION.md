# Instrucciones de instalación y ejecución

## Requisitos previos
- Node.js 16 o superior
- MongoDB Atlas (o MongoDB local)
- npm o yarn

## Instalación

Para instalar todas las dependencias tanto del backend como del frontend:

```bash
npm install
```

Este comando ejecutará automáticamente la instalación de dependencias para ambos proyectos.

## Iniciar la aplicación

### Modo desarrollo 

Para iniciar la aplicación en modo desarrollo con reinicio automático:

```bash
npm run dev
```

Este comando:
1. Inicia el servidor backend con nodemon
2. Espera a que el servidor se inicie y se conecte a MongoDB
3. Una vez el servidor está listo, inicia el servidor de desarrollo de Angular

### Solo backend (para desarrollo)

Si necesitas ejecutar solo el backend:

```bash
npm run dev:backend
```

### Producción

Para compilar el frontend y ejecutar en modo producción:

```bash
npm run prod
```

Este comando compila el frontend y lo sirve desde el servidor Express.

## Problemas comunes

### Errores de conexión a MongoDB

Si tienes problemas con la conexión a MongoDB:
1. Verifica que las credenciales sean correctas
2. Asegúrate de tener acceso a internet 
3. Verifica que la dirección IP esté en la lista blanca de MongoDB Atlas

### Errores en el frontend

Si encuentras errores en el frontend después de actualizar el código:
1. Detén la aplicación
2. Ejecuta `npm run install:frontend` para actualizar dependencias
3. Inicia la aplicación nuevamente con `npm run dev`

### Versión compilada no actualizada

Si los cambios no aparecen en la versión compilada:
1. Ejecuta `npm run build` para recompilar el frontend
2. Reinicia el servidor con `npm start`