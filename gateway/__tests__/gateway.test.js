const GatewayService = require('../GatewayService');

// Mock de axios para evitar llamadas reales
jest.mock('axios');
const axios = require('axios');

// Crear instancia del GatewayService para pruebas
let gatewayService;

beforeAll(() => {
  // Configurar variables de entorno para pruebas
  process.env.JWT_SECRET = 'test-secret';
  process.env.USUARIOS_URL = 'http://localhost:3001';
  process.env.PAGOS_URL = 'http://localhost:3002';
  process.env.CATALOGO_URL = 'http://localhost:3004';
  
  // Crear instancia del GatewayService
  gatewayService = new GatewayService();
});

// Mock de respuestas de microservicios
axios.get.mockImplementation((url) => {
  if (url.includes('/health')) {
    return Promise.resolve({
      data: { mensaje: 'Microservicio funcionando' },
      status: 200
    });
  }
  return Promise.reject(new Error('Mock error'));
});

describe('GatewayService', () => {
  describe('getInfo()', () => {
    test('should return gateway information', () => {
      const info = gatewayService.getInfo();
      
      expect(info).toBeDefined();
      expect(info.pattern).toBe('API Gateway');
      expect(info.version).toBe('1.0.0');
      expect(info.services).toBeDefined();
    });
  });

  describe('getStats()', () => {
    test('should return gateway statistics', () => {
      const stats = gatewayService.getStats();
      
      expect(stats).toBeDefined();
      expect(stats.totalRequests).toBe(0); // Inicialmente 0
      expect(stats.requestsLastHour).toBe(0); // Inicialmente 0
      expect(stats.averageResponseTime).toBe(0); // Inicialmente 0
      expect(stats.services).toBeDefined();
      expect(stats.rateLimitClients).toBe(0); // Inicialmente 0
      expect(stats.uptime).toBeDefined();
    });
  });

  describe('getCircuitBreakerStates()', () => {
    test('should return circuit breaker states', () => {
      const states = gatewayService.getCircuitBreakerStates();
      
      expect(states).toBeDefined();
      expect(states.global).toBeDefined();
      expect(states.global.totalBreakers).toBeDefined();
    });
  });

  describe('addMiddleware()', () => {
    test('should add middleware successfully', () => {
      const middleware = jest.fn();
      
      gatewayService.addMiddleware('test', middleware);
      
      // Verificar que el middleware se agregó
      expect(gatewayService.middleware).toBeDefined();
    });
  });

  describe('getInfo()', () => {
    test('should return complete gateway information', () => {
      const info = gatewayService.getInfo();
      
      expect(info).toBeDefined();
      expect(info.pattern).toBe('API Gateway');
      expect(info.version).toBe('1.0.0');
      expect(info.services).toBeDefined();
      expect(info.middleware).toBeDefined();
      expect(info.circuitBreakers).toBeDefined();
    });
  });

  describe('Circuit Breaker functionality', () => {
    test('should have circuit breakers configured', () => {
      const states = gatewayService.getCircuitBreakerStates();
      
      expect(states).toBeDefined();
      expect(states.global).toBeDefined();
      expect(states.global.totalBreakers).toBeGreaterThan(0);
    });

    test('should reset circuit breaker', () => {
      expect(() => {
        gatewayService.resetCircuitBreaker('usuarios');
      }).not.toThrow();
    });

    test('should reset all circuit breakers', () => {
      expect(() => {
        gatewayService.resetAllCircuitBreakers();
      }).not.toThrow();
    });
  });

  describe('Rate Limiting', () => {
    test('should have rate limit store', () => {
      expect(gatewayService.rateLimitStore).toBeDefined();
      expect(gatewayService.rateLimitStore.size).toBe(0);
    });
  });

  describe('Logging', () => {
    test('should have logs array', () => {
      expect(gatewayService.logs).toBeDefined();
      expect(Array.isArray(gatewayService.logs)).toBe(true);
    });

    test('should clean up logs', () => {
      expect(() => {
        gatewayService.cleanupLogs();
      }).not.toThrow();
    });
  });

  describe('Service Configuration', () => {
    test('should have services configured', () => {
      expect(gatewayService.services).toBeDefined();
      expect(Object.keys(gatewayService.services).length).toBeGreaterThan(0);
    });

    test('should have routes configured', () => {
      expect(gatewayService.routes).toBeDefined();
    });
  });
});
