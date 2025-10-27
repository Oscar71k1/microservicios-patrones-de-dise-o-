const express = require('express');
const cors = require('cors');
const GatewayService = require('./GatewayService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para CORS y parsing de JSON
app.use(cors());
app.use(express.json());

// API Gateway Pattern - Crear instancia del servicio
const gatewayService = new GatewayService();
console.log('🏛️ API Gateway Pattern: Servicio inicializado');
console.log('📊 Info del Gateway:', gatewayService.getInfo());

// API Gateway Pattern - Rutas con middleware integrado
// Redirigir peticiones de usuarios al microservicio correspondiente
app.all('/api/usuarios/*', async (req, res) => {
  await gatewayService.executeMiddleware(req, res, () => {
    gatewayService.processRequest('usuarios', req, res);
  });
});

// Redirigir peticiones de pagos al microservicio correspondiente
app.all('/api/pagos/*', async (req, res) => {
  await gatewayService.executeMiddleware(req, res, () => {
    gatewayService.processRequest('pagos', req, res);
  });
});

// Redirigir peticiones de catálogo al microservicio correspondiente
app.all('/api/catalogo/*', async (req, res) => {
  await gatewayService.executeMiddleware(req, res, () => {
    gatewayService.processRequest('catalogo', req, res);
  });
});

// Ruta de salud del gateway
app.get('/health', (req, res) => {
  res.json({ 
    mensaje: 'API Gateway funcionando correctamente',
    timestamp: new Date().toISOString(),
    pattern: 'API Gateway Pattern',
    info: gatewayService.getInfo()
  });
});

// Ruta de estadísticas del gateway
app.get('/stats', (req, res) => {
  res.json({
    mensaje: 'Estadísticas del API Gateway',
    stats: gatewayService.getStats(),
    timestamp: new Date().toISOString()
  });
});

// Ruta de estado de Circuit Breakers
app.get('/circuit-breakers', (req, res) => {
  res.json({
    mensaje: 'Estado de Circuit Breakers',
    circuitBreakers: gatewayService.getCircuitBreakerStates(),
    timestamp: new Date().toISOString()
  });
});

// Ruta para resetear Circuit Breaker específico
app.post('/circuit-breakers/:service/reset', (req, res) => {
  const { service } = req.params;
  gatewayService.resetCircuitBreaker(service);
  
  res.json({
    mensaje: `Circuit Breaker para ${service} reseteado`,
    service,
    timestamp: new Date().toISOString()
  });
});

// Ruta para resetear todos los Circuit Breakers
app.post('/circuit-breakers/reset-all', (req, res) => {
  gatewayService.resetAllCircuitBreakers();
  
  res.json({
    mensaje: 'Todos los Circuit Breakers reseteados',
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz con información del sistema
app.get('/', (req, res) => {
  res.json({
    mensaje: 'Sistema de Gestión de Inscripciones y Pagos',
    version: '1.0.0',
    arquitectura: 'Microservicios con Patrones de Diseño',
    patterns: ['Factory Method', 'API Gateway', 'Observer', 'Circuit Breaker'],
    endpoints: {
      usuarios: '/api/usuarios',
      pagos: '/api/pagos',
      catalogo: '/api/catalogo',
      salud: '/health',
      estadisticas: '/stats',
      circuitBreakers: '/circuit-breakers'
    }
  });
});

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error('Error en API Gateway:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    mensaje: err.message
  });
});

// Limpiar logs antiguos cada hora
setInterval(() => {
  gatewayService.cleanupLogs();
}, 60 * 60 * 1000);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 API Gateway ejecutándose en puerto ${PORT}`);
  console.log('🏛️ API Gateway Pattern implementado');
  console.log('📊 Servicios configurados:');
  console.log(`   - Usuarios: ${gatewayService.services.usuarios.url}`);
  console.log(`   - Pagos: ${gatewayService.services.pagos.url}`);
  console.log(`   - Catálogo: ${gatewayService.services.catalogo.url}`);
  console.log(`🔧 Middleware activo: ${gatewayService.middleware.map(m => m.name).join(', ')}`);
  console.log(`🔒 Circuit Breakers: ${gatewayService.circuitBreakerManager.getGlobalMetrics().totalBreakers} configurados`);
});
