<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Descripción
Proyecto de prueba técnica con Node.js, NestJS, Socket.IO, SQLite y Prisma ORM. Sistema de gestión de tareas (To-Do List) en tiempo real con WebSockets.

## Instalación de dependencias

```bash
$ npm install
```

## Configurar Variables de Entorno
Dentro del repositorio se encuentra un archivo **.env.example**. Este está configurado de tal forma que si se le remueve la extensión **.example**, el archivo será utilizable por el software.

```bash
# .env
DATABASE_URL = "file:./dev.db"  # En este caso en particular, como se optó por SQLite, se le da la URL del archivo .db
PORT_API     = 3000             # Puerto en el que se quiere ejecutar la aplicación (Por defecto es 3000)

```

## Generar cliente de ORM (Prisma)
Para automatizar y reducir la cantidad de código se optó por Prisma como ORM de base de datos. De esta forma, con un par de comandos, la conexión y la instancia de la base de datos van a estar disponibles de forma nativa en el proyecto con la instancia service de **path: /src/core/services/prisma/prisma.service.ts**

**Para poder utilizarla hay que ejecutar el comando:**
```bash
# Generar el cliente
$ npx prisma generate
```

## Migrar la base de datos
```bash
# Aplicar migraciones (si es la primera vez)
$ npx prisma migrate dev

# O resetear la base de datos si hay problemas
$ npx prisma migrate reset
```

## Compilar y ejecutar el proyecto

```bash
# Inicializar el proyecto
$ npm run start

# Inicializar el proyecto con espera de cambios (Desarrollo)
$ npm run start:dev

# Inicializar el proyecto en modo producción
$ npm run start:prod
```

## API Endpoints

La API REST está disponible en `http://localhost:3000/tasks` con los siguientes endpoints:

### Crear una tarea
```bash
POST /tasks
Content-Type: application/json

{
  "titulo": "Mi nueva tarea",
  "descripcion": "Descripción de la tarea (opcional)"
}
```

### Obtener todas las tareas
```bash
GET /tasks
```

### Actualizar una tarea
```bash
PUT /tasks/:id
Content-Type: application/json

{
  "status": "completada"
}
```

### Eliminar una tarea
```bash
DELETE /tasks/:id
```

## WebSockets

La aplicación utiliza Socket.IO para actualizaciones en tiempo real. Los eventos disponibles son:

### Eventos del servidor:
- `taskCreated`: Se emite cuando se crea una nueva tarea
- `taskUpdated`: Se emite cuando se actualiza una tarea existente  
- `taskDeleted`: Se emite cuando se elimina una tarea

### Cómo probar los WebSockets:

#### Opción 1: Cliente HTML básico (Incluido en el proyecto)
Se incluye un archivo `test-client.html` en la raíz del proyecto que proporciona una interfaz web completa para probar toda la funcionalidad:

1. Abrir `test-client.html` en tu navegador
2. El cliente se conectará automáticamente al servidor WebSocket
3. Se pueden crear, actualizar y eliminar tareas

**Características del cliente de prueba:**
- Conexión automática a WebSocket
- Interfaz para todas las operaciones CRUD
- Lista de todas las tareas con estado actualizado

#### Opción 2: Usar Postman
1. Crear una nueva request WebSocket en Postman
2. Conectar a: `ws://localhost:3000`
3. Escuchar los eventos mientras usas los endpoints REST, dentro de la carpeta **/docs** hay una imagen de demostracion de como debe estar configurado Postman.

## Decisiones de Diseño
### Arquitectura
- **NestJS**: Elegido por su arquitectura modular y su excelente integración con TypeScript y Framework de Express.
- **Prisma ORM**: Seleccionado por su type-safety, migraciones automáticas y generación de código
- **SQLite**: Base de datos ligera ideal para desarrollo y pruebas
- **Socket.IO**: Para WebSockets con fallback automático y mejor compatibilidad

### Estructura del Proyecto
- **Modular**: Separación clara entre módulos (tasks), servicios core (prisma) y sockets
- **DTOs con validación**: Uso de class-validator para validación robusta de datos
- **Inyección de dependencias**: Patrón nativo de NestJS para mejor testabilidad

### Modelo de Datos
- **Estados de tarea**: `pendiente`, `en_progreso`, `completada` (Para establecer una norma de cuales pueden ser los estados).
- **Timestamps automáticos**: `fechaCreacion` y `fechaActualizacion` gestionados por Prisma
- **Validaciones**: Límites de caracteres según especificaciones (100 para título, 500 para descripción)


## Contacto

- Author  - [Lucas Benjamín González Espinosa](https://www.linkedin.com/in/lucas-gonzalez-espinosa/)
- Mail    - lucas.gonzalez.espinosa@outlook.com
- Website - [@portfolio](https://lucke.cl)
- Twitter - [@nestframework](https://twitter.com/nestframework)
