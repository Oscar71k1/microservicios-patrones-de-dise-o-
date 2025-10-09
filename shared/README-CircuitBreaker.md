# Circuit Breaker Pattern - Implementación

## **Descripción**

Implementación del patrón **Circuit Breaker** para proteger el sistema contra fallos en cascada. Proporciona resiliencia, recuperación automática y monitoreo de la salud de los servicios.

## **Arquitectura**

```
Cliente → Circuit Breaker → Microservicio
    ↓
[CLOSED → OPEN → HALF_OPEN → CLOSED]
```

## **Estados del Circuit Breaker**

### **🟢 CLOSED (Cerrado)**
- **Estado normal**: Las peticiones pasan normalmente
- **Monitoreo**: Cuenta fallos y éxitos
- **Transición**: Se abre cuando se alcanza el umbral de fallos

### **🔴 OPEN (Abierto)**
- **Estado de fallo**: Las peticiones se rechazan inmediatamente
- **Timeout**: Espera un tiempo antes de intentar recuperación
- **Transición**: Se mueve a HALF_OPEN después del timeout

### **🟡 HALF_OPEN (Semi-abierto)**
- **Estado de prueba**: Permite peticiones limitadas para probar recuperación
- **Evaluación**: Si la petición es exitosa, vuelve a CLOSED
- **Transición**: Si falla, vuelve a OPEN

## **Componentes Implementados**

### **🔒 CircuitBreaker**
- ✅ **Gestión de Estados**: CLOSED, OPEN, HALF_OPEN
- ✅ **Umbral de Fallos**: Configurable (default: 5)
- ✅ **Timeout**: Configurable (default: 60s)
- ✅ **Reset Timeout**: Configurable (default: 30s)
- ✅ **Métricas**: Estadísticas detalladas

### **🔧 CircuitBreakerManager**
- ✅ **Gestión Centralizada**: Múltiples Circuit Breakers
- ✅ **Configuración**: Parámetros por servicio
- ✅ **Monitoreo**: Estado global y individual
- ✅ **Operaciones**: Reset individual y global

### **📊 Métricas y Monitoreo**
- ✅ **Estadísticas**: Total, éxitos, fallos, tasa de éxito
- ✅ **Estados**: Conteo por estado
- ✅ **Tiempos**: Último fallo, último éxito
- ✅ **Historial**: Cambios de estado

## **Configuración**

### **Parámetros del Circuit Breaker**
```javascript
const breaker = new CircuitBreaker({
  name: 'usuarios',
  failureThreshold: 5,        // Fallos antes de abrir
  timeout: 60000,            // Timeout de petición (60s)
  resetTimeout: 30000,       // Tiempo antes de intentar reset (30s)
  monitoringPeriod: 10000    // Período de monitoreo (10s)
});
```

### **Callbacks de Eventos**
```javascript
const breaker = new CircuitBreaker({
  name: 'usuarios',
  onStateChange: (oldState, newState, breaker) => {
    console.log(`Estado cambió: ${oldState} → ${newState}`);
  },
  onFailure: (error) => {
    console.log('Fallo registrado:', error.message);
  },
  onSuccess: (result) => {
    console.log('Éxito registrado');
  }
});
```

## **Uso del Circuit Breaker**

### **Ejecutar con Protección**
```javascript
const breaker = circuitBreakerManager.getBreaker('usuarios');

try {
  const result = await breaker.execute(async () => {
    return await axios.get('http://localhost:3001/health');
  });
  console.log('Respuesta:', result.data);
} catch (error) {
  if (error.name === 'CircuitBreakerOpenError') {
    console.log('Circuit Breaker abierto, servicio no disponible');
  } else {
    console.log('Error en la petición:', error.message);
  }
}
```

### **Gestión de Estados**
```javascript
// Obtener estado actual
const state = breaker.getState();
console.log('Estado:', state.state);
console.log('Fallos:', state.failures);

// Obtener métricas
const metrics = breaker.getMetrics();
console.log('Tasa de éxito:', metrics.successRate);

// Resetear Circuit Breaker
breaker.reset();

// Forzar estado
breaker.forceOpen();
breaker.forceClosed();
```

## **Integración en API Gateway**

### **Configuración Automática**
```javascript
// Circuit Breakers se crean automáticamente para cada microservicio
setupCircuitBreakers() {
  Object.keys(this.services).forEach(serviceName => {
    const breaker = this.circuitBreakerManager.getBreaker(serviceName, {
      failureThreshold: 5,
      timeout: this.services[serviceName].timeout,
      resetTimeout: 30000
    });
  });
}
```

### **Protección de Peticiones**
```javascript
// Todas las peticiones pasan por Circuit Breaker
const response = await circuitBreaker.execute(async () => {
  return await this.makeServiceRequest(serviceName, req);
});
```

## **Endpoints de Monitoreo**

### **Estado de Circuit Breakers**
```bash
GET /circuit-breakers
```
**Respuesta:**
```json
{
  "mensaje": "Estado de Circuit Breakers",
  "circuitBreakers": {
    "global": {
      "totalBreakers": 3,
      "openBreakers": 0,
      "halfOpenBreakers": 0,
      "closedBreakers": 3
    },
    "breakers": [
      {
        "name": "usuarios",
        "state": "CLOSED",
        "failures": 0,
        "successes": 15,
        "metrics": {
          "totalRequests": 15,
          "successfulRequests": 15,
          "failedRequests": 0,
          "successRate": "100.00%"
        }
      }
    ]
  }
}
```

### **Reset de Circuit Breaker**
```bash
POST /circuit-breakers/usuarios/reset
```
**Respuesta:**
```json
{
  "mensaje": "Circuit Breaker para usuarios reseteado",
  "service": "usuarios",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### **Reset de Todos los Circuit Breakers**
```bash
POST /circuit-breakers/reset-all
```
**Respuesta:**
```json
{
  "mensaje": "Todos los Circuit Breakers reseteados",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## **Manejo de Errores**

### **Circuit Breaker Abierto**
```json
{
  "error": "Servicio temporalmente no disponible",
  "service": "usuarios",
  "message": "El servicio está experimentando problemas. Intente más tarde.",
  "circuitBreakerState": "OPEN",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### **Timeout del Circuit Breaker**
```json
{
  "error": "Timeout del servicio",
  "service": "usuarios",
  "message": "El servicio tardó demasiado en responder",
  "circuitBreakerState": "TIMEOUT",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## **Fallback y Recuperación**

### **Estrategias de Fallback**
```javascript
// En microservicio de pagos
if (error.name === 'CircuitBreakerOpenError') {
  console.log('🔒 Circuit Breaker abierto para usuarios, usando fallback');
  return { 
    existe: false, 
    error: 'Servicio de usuarios temporalmente no disponible',
    fallback: true
  };
}
```

### **Recuperación Automática**
1. **Detección de Fallo**: Circuit Breaker detecta fallos consecutivos
2. **Apertura**: Se abre después del umbral de fallos
3. **Timeout**: Espera el tiempo de reset configurado
4. **Prueba**: Se mueve a HALF_OPEN para probar recuperación
5. **Recuperación**: Si la prueba es exitosa, vuelve a CLOSED

## **Beneficios del Circuit Breaker Pattern**

### **🛡️ Protección**
- Previene fallos en cascada
- Aísla servicios problemáticos
- Protege recursos del sistema

### **⚡ Performance**
- Respuestas rápidas cuando el servicio está caído
- Evita timeouts largos
- Reduce carga en servicios fallidos

### **🔄 Recuperación**
- Recuperación automática
- Pruebas de salud periódicas
- Monitoreo continuo

### **📊 Observabilidad**
- Métricas detalladas
- Estados visibles
- Historial de cambios

## **Configuración por Microservicio**

### **API Gateway**
```javascript
// Circuit Breakers para todos los microservicios
usuarios: { failureThreshold: 5, timeout: 5000, resetTimeout: 30000 }
pagos: { failureThreshold: 5, timeout: 5000, resetTimeout: 30000 }
catalogo: { failureThreshold: 5, timeout: 5000, resetTimeout: 30000 }
```

### **Microservicio de Pagos**
```javascript
// Circuit Breaker para comunicación con usuarios
usuarios: { failureThreshold: 3, timeout: 5000, resetTimeout: 30000 }
```

## **Monitoreo y Alertas**

### **Métricas Clave**
- **Tasa de Éxito**: Porcentaje de peticiones exitosas
- **Tiempo de Recuperación**: Tiempo para volver a CLOSED
- **Frecuencia de Apertura**: Cuántas veces se abre el Circuit Breaker
- **Estado Actual**: CLOSED, OPEN, HALF_OPEN

### **Alertas Recomendadas**
- Circuit Breaker abierto por más de 5 minutos
- Tasa de éxito menor al 80%
- Múltiples Circuit Breakers abiertos simultáneamente

## **Logs del Circuit Breaker**

### **Cambios de Estado**
```
🔒 Circuit Breaker 'usuarios': CLOSED → OPEN
🔒 Circuit Breaker 'usuarios': OPEN → HALF_OPEN
🔒 Circuit Breaker 'usuarios': HALF_OPEN → CLOSED
```

### **Métricas**
```
✅ Circuit Breaker 'usuarios': Success recorded
❌ Circuit Breaker 'usuarios': Failure recorded (3/5)
🔄 Circuit Breaker 'usuarios': Reset to CLOSED
```

## **Próximos Pasos**

1. **Health Checks**: Endpoints de salud para monitoreo
2. **Load Balancing**: Distribución de carga entre instancias
3. **Service Discovery**: Descubrimiento automático de servicios
4. **Distributed Tracing**: Trazabilidad de peticiones

---

**Circuit Breaker Pattern** implementado exitosamente ✅


