# API Gateway Pattern - Implementación

## **Descripción**

Implementación del patrón **API Gateway** como punto único de entrada para todos los microservicios. Proporciona autenticación centralizada, rate limiting, logging, monitoreo y transformación de respuestas.

## **Arquitectura**

```
Cliente → API Gateway → Microservicios
    ↓
[Autenticación, Rate Limiting, Logging, Transformación]
```

## **Características Implementadas**

### **🔐 Autenticación Centralizada**
- ✅ **JWT Token Validation**: Verificación automática de tokens
- ✅ **Rutas Públicas**: Login y registro sin autenticación
- ✅ **Headers de Usuario**: Propagación de información de usuario

### **⚡ Rate Limiting**
- ✅ **Límite por IP**: 100 requests por 15 minutos
- ✅ **Almacenamiento en Memoria**: Tracking de requests por cliente
- ✅ **Respuesta 429**: Rate limit exceeded con retry-after

### **📊 Logging y Monitoreo**
- ✅ **Logs Detallados**: Método, path, IP, user-agent, duración
- ✅ **Estadísticas en Tiempo Real**: Requests, tiempo promedio, servicios
- ✅ **Limpieza Automática**: Logs antiguos eliminados cada hora

### **🔄 Transformación de Respuestas**
- ✅ **Metadatos del Gateway**: Servicio, timestamp, versión
- ✅ **Normalización**: Respuestas consistentes entre microservicios
- ✅ **Error Handling**: Manejo centralizado de errores

### **🛡️ Resiliencia**
- ✅ **Retry Logic**: Reintentos automáticos con backoff exponencial
- ✅ **Circuit Breaker**: Protección contra fallos en cascada
- ✅ **Timeout Management**: Timeouts configurables por servicio

## **Configuración**

### **Variables de Entorno**

```bash
# Puerto del gateway
PORT=3000

# URLs de microservicios
USUARIOS_URL=http://localhost:3001
PAGOS_URL=http://localhost:3002
CATALOGO_URL=http://localhost:3004

# JWT Secret
JWT_SECRET=tu-clave-secreta-jwt
```

### **Servicios Configurados**

```javascript
const services = {
  usuarios: {
    url: 'http://localhost:3001',
    timeout: 5000,
    retries: 3
  },
  pagos: {
    url: 'http://localhost:3002',
    timeout: 5000,
    retries: 3
  },
  catalogo: {
    url: 'http://localhost:3004',
    timeout: 5000,
    retries: 3
  }
};
```

## **Endpoints del Gateway**

### **Rutas de Microservicios**
- `GET/POST/PUT/DELETE /api/usuarios/*` → Microservicio de Usuarios
- `GET/POST/PUT/DELETE /api/pagos/*` → Microservicio de Pagos
- `GET/POST/PUT/DELETE /api/catalogo/*` → Microservicio de Catálogo

### **Rutas del Gateway**
- `GET /health` - Estado del gateway
- `GET /stats` - Estadísticas en tiempo real
- `GET /` - Información del sistema

## **Middleware Implementado**

### **1. Logging Middleware**
```javascript
// Registra todas las peticiones con detalles
{
  timestamp: '2024-01-15T10:30:00.000Z',
  method: 'GET',
  path: '/api/usuarios/health',
  ip: '127.0.0.1',
  userAgent: 'Mozilla/5.0...',
  userId: 'user123',
  duration: 45,
  statusCode: 200
}
```

### **2. Rate Limiting Middleware**
```javascript
// Límite: 100 requests por 15 minutos por IP
// Respuesta cuando se excede:
{
  error: 'Rate limit exceeded',
  message: 'Too many requests, please try again later',
  retryAfter: 900
}
```

### **3. Authentication Middleware**
```javascript
// Rutas públicas (sin autenticación):
['/health', '/api/usuarios/login', '/api/usuarios/registro']

// Headers requeridos para rutas protegidas:
Authorization: Bearer <jwt-token>
```

## **Transformación de Respuestas**

### **Respuesta Original del Microservicio**
```json
{
  "mensaje": "Usuario creado exitosamente",
  "usuario": { "id": "123", "nombre": "Juan" }
}
```

### **Respuesta Transformada por el Gateway**
```json
{
  "mensaje": "Usuario creado exitosamente",
  "usuario": { "id": "123", "nombre": "Juan" },
  "_gateway": {
    "service": "usuarios",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

## **Manejo de Errores**

### **Tipos de Errores**

1. **Error del Microservicio (4xx/5xx)**
```json
{
  "error": "Error en microservicio",
  "service": "usuarios",
  "message": "Usuario no encontrado",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

2. **Servicio No Disponible (503)**
```json
{
  "error": "Servicio no disponible",
  "service": "pagos",
  "message": "El microservicio no está respondiendo",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

3. **Rate Limit Exceeded (429)**
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests, please try again later",
  "retryAfter": 900
}
```

## **Estadísticas en Tiempo Real**

### **Endpoint: GET /stats**
```json
{
  "mensaje": "Estadísticas del API Gateway",
  "stats": {
    "totalRequests": 1250,
    "requestsLastHour": 45,
    "averageResponseTime": 120,
    "services": ["usuarios", "pagos", "catalogo"],
    "rateLimitClients": 12,
    "uptime": 3600
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## **Beneficios del API Gateway Pattern**

### **🔒 Seguridad**
- Autenticación centralizada
- Rate limiting por IP
- Validación de tokens JWT

### **📊 Monitoreo**
- Logs detallados de todas las peticiones
- Estadísticas en tiempo real
- Métricas de rendimiento

### **🛡️ Resiliencia**
- Retry automático con backoff exponencial
- Manejo de timeouts
- Protección contra fallos en cascada

### **🔄 Consistencia**
- Transformación de respuestas
- Manejo centralizado de errores
- Interfaz unificada para clientes

### **⚡ Performance**
- Caching de respuestas (futuro)
- Load balancing (futuro)
- Compresión de respuestas (futuro)

## **Próximos Pasos**

1. **Observer Pattern**: Sistema de eventos entre microservicios
2. **Circuit Breaker Pattern**: Protección avanzada contra fallos
3. **Caching Layer**: Redis para respuestas frecuentes
4. **Load Balancing**: Distribución de carga entre instancias

---

**API Gateway Pattern** implementado exitosamente ✅


