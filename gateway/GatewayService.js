/**
 * API Gateway Pattern - GatewayService
 * 
 * Punto único de entrada para todos los microservicios
 * Maneja autenticación, rate limiting, logging y transformación de datos
 */

const axios = require('axios');
const jwt = require('jsonwebtoken');
const { CircuitBreakerManager } = require('../shared/CircuitBreaker');

/**
 * @class GatewayService
 * @description Servicio principal del API Gateway que maneja todas las peticiones entrantes
 * @example
 * const gateway = new GatewayService();
 * gateway.addRoute('/api/usuarios', 'usuarios');
 */
class GatewayService {
  /**
   * @constructor
   * @description Inicializa el GatewayService con configuraciones por defecto
   */
  constructor() {
    this.routes = new Map();
    this.middleware = [];
    this.rateLimitStore = new Map();
    this.logs = [];
    
    // Circuit Breaker Pattern - Manager de Circuit Breakers
    this.circuitBreakerManager = new CircuitBreakerManager();
    
    // Configuración de microservicios
    this.services = {
      usuarios: {
        url: process.env.USUARIOS_URL || 'http://localhost:3001',
        timeout: 5000,
        retries: 3
      },
      pagos: {
        url: process.env.PAGOS_URL || 'http://localhost:3002',
        timeout: 5000,
        retries: 3
      },
      catalogo: {
        url: process.env.CATALOGO_URL || 'http://localhost:3004',
        timeout: 5000,
        retries: 3
      }
    };

    this.setupCircuitBreakers();
    this.setupDefaultMiddleware();
  }

  /**
   * Configurar Circuit Breakers para cada microservicio
   */
  setupCircuitBreakers() {
    Object.keys(this.services).forEach(serviceName => {
      const breaker = this.circuitBreakerManager.getBreaker(serviceName, {
        failureThreshold: 5,
        timeout: this.services[serviceName].timeout,
        resetTimeout: 30000,
        onStateChange: (oldState, newState, breaker) => {
          console.log(`🔒 Circuit Breaker '${serviceName}': ${oldState} → ${newState}`);
        },
        onFailure: (error) => {
          console.log(`❌ Circuit Breaker '${serviceName}': Failure - ${error.message}`);
        },
        onSuccess: (result) => {
          console.log(`✅ Circuit Breaker '${serviceName}': Success`);
        }
      });
    });
    console.log('🔒 Circuit Breaker Pattern: Circuit Breakers configurados para microservicios');
  }

  /**
   * Configurar middleware por defecto
   */
  setupDefaultMiddleware() {
    // Middleware de logging
    this.addMiddleware('logging', (req, res, next) => {
      const startTime = Date.now();
      const logEntry = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id || 'anonymous'
      };

      res.on('finish', () => {
        logEntry.duration = Date.now() - startTime;
        logEntry.statusCode = res.statusCode;
        this.logs.push(logEntry);
        console.log(`📊 Gateway Log: ${logEntry.method} ${logEntry.path} - ${logEntry.statusCode} (${logEntry.duration}ms)`);
      });

      next();
    });

    // Middleware de rate limiting
    this.addMiddleware('rateLimit', (req, res, next) => {
      const clientId = req.ip || 'unknown';
      const now = Date.now();
      const windowMs = 15 * 60 * 1000; // 15 minutos
      const maxRequests = 100; // 100 requests por ventana

      if (!this.rateLimitStore.has(clientId)) {
        this.rateLimitStore.set(clientId, { count: 0, resetTime: now + windowMs });
      }

      const clientData = this.rateLimitStore.get(clientId);

      if (now > clientData.resetTime) {
        clientData.count = 0;
        clientData.resetTime = now + windowMs;
      }

      if (clientData.count >= maxRequests) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Too many requests, please try again later',
          retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
        });
      }

      clientData.count++;
      next();
    });

    // Middleware de autenticación
    this.addMiddleware('auth', (req, res, next) => {
      // Rutas públicas que no requieren autenticación
      const publicRoutes = ['/health', '/api/usuarios/login', '/api/usuarios/registro'];
      
      if (publicRoutes.includes(req.path)) {
        return next();
      }

      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      console.log(`🔐 Auth Middleware - Path: ${req.path}`);
      console.log(`🔐 Auth Header: ${authHeader ? 'Present' : 'Missing'}`);
      console.log(`🔐 Token: ${token ? 'Present' : 'Missing'}`);

      if (!token) {
        console.log(`❌ Auth Error: No token provided for ${req.path}`);
        return res.status(401).json({ 
          error: 'Token de acceso requerido',
          message: 'Debe proporcionar un token de autenticación'
        });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave-secreta-desarrollo');
        req.user = decoded;
        console.log(`✅ Auth Success: User ${decoded.id} authenticated for ${req.path}`);
        next();
      } catch (error) {
        console.log(`❌ Auth Error: Invalid token for ${req.path} - ${error.message}`);
        return res.status(403).json({ 
          error: 'Token inválido',
          message: 'El token proporcionado no es válido o ha expirado',
          details: error.message
        });
      }
    });
  }

  /**
   * Agregar middleware personalizado
   * @param {string} name - Nombre del middleware
   * @param {Function} middleware - Función del middleware
   */
  addMiddleware(name, middleware) {
    this.middleware.push({ name, middleware });
    console.log(`🔧 Middleware agregado: ${name}`);
  }

  /**
   * Ejecutar todos los middlewares
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async executeMiddleware(req, res, next) {
    let index = 0;

    const runNext = async () => {
      if (index >= this.middleware.length) {
        return next();
      }

      const { middleware } = this.middleware[index++];
      middleware(req, res, runNext);
    };

    await runNext();
  }

  /**
   * Procesar petición a microservicio con Circuit Breaker
   * @param {string} serviceName - Nombre del servicio
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  async processRequest(serviceName, req, res) {
    try {
      const service = this.services[serviceName];
      if (!service) {
        return res.status(404).json({
          error: 'Servicio no encontrado',
          message: `El servicio '${serviceName}' no está disponible`
        });
      }

      // Obtener Circuit Breaker para el servicio
      const circuitBreaker = this.circuitBreakerManager.getBreaker(serviceName);

      // Ejecutar petición con Circuit Breaker
      const response = await circuitBreaker.execute(async () => {
        return await this.makeServiceRequest(serviceName, req);
      });

      // Transformar respuesta
      const transformedResponse = this.transformResponse(response.data, serviceName);

      console.log(`✅ Gateway: Respuesta exitosa de ${serviceName}`);
      res.status(response.status).json(transformedResponse);

    } catch (error) {
      console.error(`❌ Gateway Error: ${serviceName}`, error.message);
      
      // Manejar errores del Circuit Breaker
      if (error.name === 'CircuitBreakerOpenError') {
        return res.status(503).json({
          error: 'Servicio temporalmente no disponible',
          service: serviceName,
          message: 'El servicio está experimentando problemas. Intente más tarde.',
          circuitBreakerState: 'OPEN',
          timestamp: new Date().toISOString()
        });
      }
      
      if (error.name === 'CircuitBreakerTimeoutError') {
        return res.status(504).json({
          error: 'Timeout del servicio',
          service: serviceName,
          message: 'El servicio tardó demasiado en responder',
          circuitBreakerState: 'TIMEOUT',
          timestamp: new Date().toISOString()
        });
      }
      
      if (error.response) {
        // Error del microservicio
        res.status(error.response.status).json({
          error: 'Error en microservicio',
          service: serviceName,
          message: error.response.data?.error || error.message,
          timestamp: new Date().toISOString()
        });
      } else if (error.code === 'ECONNREFUSED') {
        // Microservicio no disponible
        res.status(503).json({
          error: 'Servicio no disponible',
          service: serviceName,
          message: 'El microservicio no está respondiendo',
          timestamp: new Date().toISOString()
        });
      } else {
        // Error interno del gateway
        res.status(500).json({
          error: 'Error interno del gateway',
          message: 'Error inesperado en el procesamiento de la petición',
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Realizar petición al microservicio
   * @param {string} serviceName - Nombre del servicio
   * @param {Object} req - Request object
   * @returns {Promise} Respuesta del servicio
   */
  async makeServiceRequest(serviceName, req) {
    const service = this.services[serviceName];
    
    // Construir URL del microservicio
    const path = req.path.replace(`/api/${serviceName}`, '');
    const url = `${service.url}${path}`;
    
    // Agregar query parameters si existen
    const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const fullUrl = url + queryString;

    console.log(`📡 Gateway: ${req.method} ${req.path} -> ${fullUrl}`);

    // Configurar headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': req.headers.authorization,
      'X-Gateway-Request': 'true',
      'X-User-ID': req.user?.id || 'anonymous'
    };

    // Realizar petición con retry
    return await this.makeRequestWithRetry({
      method: req.method,
      url: fullUrl,
      data: req.body,
      headers,
      timeout: service.timeout
    }, service.retries);
  }

  /**
   * Realizar petición con reintentos
   * @param {Object} config - Configuración de la petición
   * @param {number} retries - Número de reintentos
   * @returns {Promise} Respuesta de la petición
   */
  async makeRequestWithRetry(config, retries = 3) {
    let lastError;

    for (let i = 0; i <= retries; i++) {
      try {
        return await axios(config);
      } catch (error) {
        lastError = error;
        
        if (i < retries && this.isRetryableError(error)) {
          const delay = Math.pow(2, i) * 1000; // Backoff exponencial
          console.log(`🔄 Reintentando petición en ${delay}ms (intento ${i + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          break;
        }
      }
    }

    throw lastError;
  }

  /**
   * Verificar si un error es reintentable
   * @param {Error} error - Error a verificar
   * @returns {boolean}
   */
  isRetryableError(error) {
    if (error.response) {
      // Errores 5xx son reintentables
      return error.response.status >= 500;
    }
    
    // Errores de conexión son reintentables
    return ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'].includes(error.code);
  }

  /**
   * Transformar respuesta del microservicio
   * @param {Object} data - Datos de la respuesta
   * @param {string} serviceName - Nombre del servicio
   * @returns {Object} Respuesta transformada
   */
  transformResponse(data, serviceName) {
    // Agregar metadatos del gateway
    return {
      ...data,
      _gateway: {
        service: serviceName,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    };
  }

  /**
   * Obtener estadísticas del gateway
   * @returns {Object} Estadísticas
   */
  getStats() {
    const now = Date.now();
    const lastHour = this.logs.filter(log => 
      new Date(log.timestamp).getTime() > now - 60 * 60 * 1000
    );

    return {
      totalRequests: this.logs.length,
      requestsLastHour: lastHour.length,
      averageResponseTime: this.calculateAverageResponseTime(),
      services: Object.keys(this.services),
      rateLimitClients: this.rateLimitStore.size,
      uptime: process.uptime()
    };
  }

  /**
   * Calcular tiempo promedio de respuesta
   * @returns {number} Tiempo promedio en ms
   */
  calculateAverageResponseTime() {
    if (this.logs.length === 0) return 0;
    
    const totalTime = this.logs.reduce((sum, log) => sum + (log.duration || 0), 0);
    return Math.round(totalTime / this.logs.length);
  }

  /**
   * Limpiar logs antiguos
   * @param {number} maxAge - Edad máxima en ms
   */
  cleanupLogs(maxAge = 24 * 60 * 60 * 1000) { // 24 horas por defecto
    const cutoff = Date.now() - maxAge;
    this.logs = this.logs.filter(log => 
      new Date(log.timestamp).getTime() > cutoff
    );
  }

  /**
   * Obtener información del gateway
   * @returns {Object} Información del gateway
   */
  getInfo() {
    return {
      pattern: 'API Gateway',
      version: '1.0.0',
      services: Object.keys(this.services),
      middleware: this.middleware.map(m => m.name),
      circuitBreakers: this.circuitBreakerManager.getInfo(),
      uptime: process.uptime(),
      stats: this.getStats()
    };
  }

  /**
   * Obtener estado de Circuit Breakers
   * @returns {Object} Estado de Circuit Breakers
   */
  getCircuitBreakerStates() {
    return {
      global: this.circuitBreakerManager.getGlobalMetrics(),
      breakers: this.circuitBreakerManager.getAllStates()
    };
  }

  /**
   * Resetear Circuit Breaker específico
   * @param {string} serviceName - Nombre del servicio
   */
  resetCircuitBreaker(serviceName) {
    const breaker = this.circuitBreakerManager.getBreaker(serviceName);
    breaker.reset();
    console.log(`🔄 Circuit Breaker '${serviceName}' reseteado`);
  }

  /**
   * Resetear todos los Circuit Breakers
   */
  resetAllCircuitBreakers() {
    this.circuitBreakerManager.resetAll();
    console.log('🔄 Todos los Circuit Breakers reseteados');
  }
}

module.exports = GatewayService;
