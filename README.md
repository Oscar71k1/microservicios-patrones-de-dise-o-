# Sistema de Gestión de Inscripciones y Pagos - Microservicios

Sistema SaaS universitario basado en microservicios con Firebase como base de datos.

## Arquitectura

- **API Gateway**: Proxy inverso que redirige las peticiones a los microservicios correspondientes
- **Microservicio de Usuarios**: Gestión de autenticación, registro y roles (Alumno/Admin)
- **Microservicio de Pagos**: Creación y gestión de órdenes de pago
- **Frontend React**: Interfaz de usuario para alumnos y administradores
- **Firebase Firestore**: Base de datos NoSQL para almacenar usuarios y pagos

## Instalación y Despliegue

### 1. Instalar dependencias
```bash
npm run install-all
```

### 2. Configurar Firebase
1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitar Firestore Database
3. Copiar las credenciales del proyecto y crear archivo `firebase-config.json` en la raíz

### 3. Levantar el sistema
```bash
npm start
```

Esto iniciará todos los servicios:
- API Gateway: http://localhost:3000
- Microservicio Usuarios: http://localhost:3001
- Microservicio Pagos: http://localhost:3002
- Frontend React: http://localhost:3003

## Estructura del Proyecto

```
├── gateway/                 # API Gateway (Express)
├── microservicios/
│   ├── usuarios/           # Microservicio de Usuarios
│   └── pagos/              # Microservicio de Pagos
├── frontend/               # Frontend React
└── firebase-config.json    # Configuración de Firebase
```

## Endpoints Principales

### API Gateway (Puerto 3000)
- `POST /api/usuarios/registro` - Registro de usuario
- `POST /api/usuarios/login` - Login de usuario
- `GET /api/usuarios/perfil` - Obtener perfil de usuario
- `POST /api/pagos/crear` - Crear orden de pago
- `GET /api/pagos/usuario/:usuarioId` - Listar pagos de usuario

### Microservicio Usuarios (Puerto 3001)
- `POST /registro` - Registro de usuario
- `POST /login` - Autenticación
- `GET /perfil/:id` - Obtener perfil
- `GET /validar/:id` - Validar existencia de usuario

### Microservicio Pagos (Puerto 3002)
- `POST /crear` - Crear orden de pago
- `GET /usuario/:usuarioId` - Listar pagos por usuario
- `GET /:id` - Obtener pago específico

## Seguridad

- Contraseñas encriptadas con bcrypt
- Autenticación JWT
- Validación de usuarios entre microservicios
- CORS configurado para desarrollo

## Tecnologías Utilizadas

- **Backend**: Node.js, Express
- **Base de Datos**: Firebase Firestore
- **Frontend**: React
- **Autenticación**: JWT + bcrypt
- **Comunicación**: HTTP REST entre microservicios

