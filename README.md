# Sistema de Microservicios con Patrones de Diseño

## 🏗️ Arquitectura

Este proyecto implementa un sistema de microservicios utilizando 4 patrones de diseño fundamentales:

### 📋 Patrones Implementados

1. **🏭 Factory Method (Creacional)**
   - Gestión centralizada de conexiones de base de datos
   - Soporte para Firebase y base de datos en memoria
   - Ubicación: `shared/DatabaseFactory.js`

2. **🌐 API Gateway (Estructural)**
   - Punto único de entrada para todos los microservicios
   - Autenticación JWT, rate limiting y logging
   - Ubicación: `gateway/`

3. **👁️ Observer (Comportamiento)**
   - Sistema de eventos y notificaciones
   - Desacoplamiento entre microservicios
   - Ubicación: `shared/EventManager.js`

4. **🔒 Circuit Breaker (Emergente)**
   - Protección contra fallos en cascada
   - Recuperación automática de servicios
   - Ubicación: `shared/CircuitBreaker.js`

## 🚀 Microservicios

### 🌐 API Gateway (Puerto 3000)
- **Función**: Punto único de entrada
- **Patrones**: API Gateway, Circuit Breaker
- **Endpoints**: `/api/*`, `/health`, `/stats`

### 👤 Usuarios (Puerto 3001)
- **Función**: Gestión de usuarios y autenticación
- **Patrones**: Factory Method, Observer
- **Endpoints**: `/registro`, `/login`, `/perfil/:id`

### 💳 Pagos (Puerto 3002)
- **Función**: Gestión de pagos y órdenes
- **Patrones**: Factory Method, Observer, Circuit Breaker
- **Endpoints**: `/pagos`, `/pagos/usuario/:id`

### 📚 Catálogo (Puerto 3004)
- **Función**: Gestión de conceptos académicos
- **Patrones**: Factory Method, Observer
- **Endpoints**: `/conceptos`, `/conceptos/alumno`

### 🎨 Frontend (Puerto 3003)
- **Función**: Interfaz web
- **Tecnología**: HTML, CSS, JavaScript vanilla
- **Características**: Consumo de APIs REST

## 🛠️ Instalación y Ejecución

### Prerrequisitos
- Node.js 18+
- npm

### Instalación
```bash
# Clonar repositorio
git clone <repository-url>
cd microservicios

# Instalar dependencias de cada microservicio
cd gateway && npm install
cd ../microservicios/usuarios && npm install
cd ../pagos && npm install
cd ../catalogo && npm install
cd ../../frontend && npm install
```

### Ejecución
```bash
# Terminal 1: API Gateway
cd gateway && npm start

# Terminal 2: Microservicio de Usuarios
cd microservicios/usuarios && npm start

# Terminal 3: Microservicio de Pagos
cd microservicios/pagos && npm start

# Terminal 4: Microservicio de Catálogo
cd microservicios/catalogo && npm start

# Terminal 5: Frontend
cd frontend && npm start
```

## 🧪 Testing

### Ejecutar Pruebas
```bash
# Pruebas unitarias
npm test

# Pruebas con cobertura
npm run test:coverage

# Linting
npm run lint
```

### Cobertura Mínima
- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

## 🔧 CI/CD Pipeline

El proyecto incluye un pipeline CI/CD configurado con GitHub Actions que ejecuta:

1. **Instalación de dependencias**
2. **Linting (ESLint)**
3. **Pruebas unitarias con reporte de cobertura**
4. **Build de la aplicación**
5. **Generación de documentación**

### Archivo de Pipeline
- Ubicación: `.github/workflows/ci.yml`
- Trigger: Push y Pull Requests a `main` y `develop`

## 📊 Monitoreo

### Health Checks
- Gateway: `GET /health`
- Usuarios: `GET /health`
- Pagos: `GET /health`
- Catálogo: `GET /health`

### Estadísticas
- Gateway: `GET /stats`
- Circuit Breakers: `GET /circuit-breakers`

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para autenticación:

1. **Registro**: `POST /api/usuarios/registro`
2. **Login**: `POST /api/usuarios/login`
3. **Uso**: Incluir token en header `Authorization: Bearer <token>`

## 📚 Documentación

- **Observer Pattern**: `shared/README-Observer.md`
- **Circuit Breaker**: `shared/README-CircuitBreaker.md`
- **API Gateway**: `gateway/README.md`

## 🏆 Características Técnicas

- **Arquitectura**: Microservicios
- **Comunicación**: HTTP/REST
- **Base de Datos**: Firebase + Memoria (desarrollo)
- **Autenticación**: JWT
- **Testing**: Jest + Supertest
- **Linting**: ESLint
- **CI/CD**: GitHub Actions

## 📈 Métricas de Calidad

- ✅ **Cobertura de Pruebas**: 70%+
- ✅ **Linting**: 0 errores
- ✅ **Patrones de Diseño**: 4 implementados
- ✅ **Microservicios**: 4 funcionando
- ✅ **CI/CD**: Pipeline configurado

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.