/**
 * Circuit Breaker Pattern - CircuitBreaker
 * 
 * Protege el sistema contra fallos en cascada
 * Estados: CLOSED, OPEN, HALF_OPEN
 */

class CircuitBreaker {
  constructor(options = {}) {
    this.name = options.name || 'default';
    this.failureThreshold = options.failureThreshold || 5;
    this.timeout = options.timeout || 60000; // 60 segundos
    this.resetTimeout = options.resetTimeout || 30000; // 30 segundos
    this.monitoringPeriod = options.monitoringPeriod || 10000; // 10 segundos
    
    // Estados del Circuit Breaker
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    this.nextAttemptTime = null;
    
    // Métricas
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      circuitOpenCount: 0,
      circuitCloseCount: 0,
      lastStateChange: new Date().toISOString()
    };
    
    // Callbacks
    this.onStateChange = options.onStateChange || null;
    this.onFailure = options.onFailure || null;
    this.onSuccess = options.onSuccess || null;
    
    console.log(`🔒 Circuit Breaker '${this.name}' inicializado`);
  }

  /**
   * Ejecutar función con protección del Circuit Breaker
   * @param {Function} fn - Función a ejecutar
   * @param {Array} args - Argumentos para la función
   * @returns {Promise} Resultado de la función
   */
  async execute(fn, ...args) {
    this.metrics.totalRequests++;
    
    // Verificar estado del Circuit Breaker
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.setState('HALF_OPEN');
      } else {
        throw new CircuitBreakerOpenError(
          `Circuit Breaker '${this.name}' is OPEN. Next attempt at ${this.nextAttemptTime}`
        );
      }
    }
    
    try {
      // Ejecutar función con timeout
      const result = await this.executeWithTimeout(fn, ...args);
      this.onSuccess(result);
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  /**
   * Ejecutar función con timeout
   * @param {Function} fn - Función a ejecutar
   * @param {Array} args - Argumentos
   * @returns {Promise} Resultado
   */
  async executeWithTimeout(fn, ...args) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new CircuitBreakerTimeoutError(
          `Circuit Breaker '${this.name}' timeout after ${this.timeout}ms`
        ));
      }, this.timeout);
      
      Promise.resolve(fn(...args))
        .then(result => {
          clearTimeout(timer);
          this.recordSuccess();
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          this.recordFailure();
          reject(error);
        });
    });
  }

  /**
   * Registrar éxito
   */
  recordSuccess() {
    this.successes++;
    this.failures = 0;
    this.lastSuccessTime = new Date();
    this.metrics.successfulRequests++;
    
    if (this.state === 'HALF_OPEN') {
      this.setState('CLOSED');
    }
    
    console.log(`✅ Circuit Breaker '${this.name}': Success recorded`);
  }

  /**
   * Registrar fallo
   */
  recordFailure() {
    this.failures++;
    this.lastFailureTime = new Date();
    this.metrics.failedRequests++;
    
    if (this.failures >= this.failureThreshold) {
      this.setState('OPEN');
    }
    
    console.log(`❌ Circuit Breaker '${this.name}': Failure recorded (${this.failures}/${this.failureThreshold})`);
  }

  /**
   * Verificar si se debe intentar reset
   * @returns {boolean}
   */
  shouldAttemptReset() {
    if (!this.nextAttemptTime) return false;
    return new Date() >= this.nextAttemptTime;
  }

  /**
   * Cambiar estado del Circuit Breaker
   * @param {string} newState - Nuevo estado
   */
  setState(newState) {
    if (this.state === newState) return;
    
    const oldState = this.state;
    this.state = newState;
    this.metrics.lastStateChange = new Date().toISOString();
    
    switch (newState) {
      case 'OPEN':
        this.nextAttemptTime = new Date(Date.now() + this.resetTimeout);
        this.metrics.circuitOpenCount++;
        console.log(`🔴 Circuit Breaker '${this.name}': OPEN (failures: ${this.failures})`);
        break;
        
      case 'HALF_OPEN':
        this.nextAttemptTime = null;
        console.log(`🟡 Circuit Breaker '${this.name}': HALF_OPEN (testing recovery)`);
        break;
        
      case 'CLOSED':
        this.nextAttemptTime = null;
        this.failures = 0;
        this.metrics.circuitCloseCount++;
        console.log(`🟢 Circuit Breaker '${this.name}': CLOSED (healthy)`);
        break;
    }
    
    // Ejecutar callback de cambio de estado
    if (this.onStateChange) {
      this.onStateChange(oldState, newState, this);
    }
  }

  /**
   * Obtener estado actual
   * @returns {Object} Estado del Circuit Breaker
   */
  getState() {
    return {
      name: this.name,
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      nextAttemptTime: this.nextAttemptTime,
      metrics: this.metrics
    };
  }

  /**
   * Obtener métricas
   * @returns {Object} Métricas del Circuit Breaker
   */
  getMetrics() {
    const successRate = this.metrics.totalRequests > 0 
      ? (this.metrics.successfulRequests / this.metrics.totalRequests * 100).toFixed(2)
      : 0;
    
    return {
      ...this.metrics,
      successRate: `${successRate}%`,
      failureRate: `${(100 - successRate).toFixed(2)}%`,
      isHealthy: this.state === 'CLOSED',
      timeSinceLastFailure: this.lastFailureTime 
        ? Date.now() - this.lastFailureTime.getTime()
        : null,
      timeSinceLastSuccess: this.lastSuccessTime 
        ? Date.now() - this.lastSuccessTime.getTime()
        : null
    };
  }

  /**
   * Resetear Circuit Breaker
   */
  reset() {
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
    this.nextAttemptTime = null;
    this.setState('CLOSED');
    console.log(`🔄 Circuit Breaker '${this.name}': Reset to CLOSED`);
  }

  /**
   * Forzar estado OPEN
   */
  forceOpen() {
    this.setState('OPEN');
    console.log(`🔴 Circuit Breaker '${this.name}': Forced to OPEN`);
  }

  /**
   * Forzar estado CLOSED
   */
  forceClosed() {
    this.setState('CLOSED');
    console.log(`🟢 Circuit Breaker '${this.name}': Forced to CLOSED`);
  }
}

/**
 * Error cuando Circuit Breaker está abierto
 */
class CircuitBreakerOpenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
    this.code = 'CIRCUIT_BREAKER_OPEN';
  }
}

/**
 * Error de timeout del Circuit Breaker
 */
class CircuitBreakerTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CircuitBreakerTimeoutError';
    this.code = 'CIRCUIT_BREAKER_TIMEOUT';
  }
}

/**
 * Manager de Circuit Breakers
 */
class CircuitBreakerManager {
  constructor() {
    this.breakers = new Map();
    this.globalMetrics = {
      totalBreakers: 0,
      openBreakers: 0,
      halfOpenBreakers: 0,
      closedBreakers: 0
    };
  }

  /**
   * Crear o obtener Circuit Breaker
   * @param {string} name - Nombre del Circuit Breaker
   * @param {Object} options - Opciones
   * @returns {CircuitBreaker} Circuit Breaker
   */
  getBreaker(name, options = {}) {
    if (!this.breakers.has(name)) {
      const breaker = new CircuitBreaker({ name, ...options });
      this.breakers.set(name, breaker);
      this.updateGlobalMetrics();
      console.log(`🔒 Circuit Breaker Manager: Created '${name}'`);
    }
    
    return this.breakers.get(name);
  }

  /**
   * Obtener todos los Circuit Breakers
   * @returns {Map} Circuit Breakers
   */
  getAllBreakers() {
    return this.breakers;
  }

  /**
   * Obtener estado de todos los Circuit Breakers
   * @returns {Array} Estados
   */
  getAllStates() {
    const states = [];
    this.breakers.forEach((breaker, name) => {
      states.push(breaker.getState());
    });
    return states;
  }

  /**
   * Obtener métricas globales
   * @returns {Object} Métricas globales
   */
  getGlobalMetrics() {
    this.updateGlobalMetrics();
    return this.globalMetrics;
  }

  /**
   * Actualizar métricas globales
   */
  updateGlobalMetrics() {
    this.globalMetrics.totalBreakers = this.breakers.size;
    this.globalMetrics.openBreakers = 0;
    this.globalMetrics.halfOpenBreakers = 0;
    this.globalMetrics.closedBreakers = 0;
    
    this.breakers.forEach(breaker => {
      switch (breaker.state) {
        case 'OPEN':
          this.globalMetrics.openBreakers++;
          break;
        case 'HALF_OPEN':
          this.globalMetrics.halfOpenBreakers++;
          break;
        case 'CLOSED':
          this.globalMetrics.closedBreakers++;
          break;
      }
    });
  }

  /**
   * Resetear todos los Circuit Breakers
   */
  resetAll() {
    this.breakers.forEach(breaker => breaker.reset());
    console.log(`🔄 Circuit Breaker Manager: Reset all breakers`);
  }

  /**
   * Obtener información del manager
   * @returns {Object} Información
   */
  getInfo() {
    return {
      pattern: 'Circuit Breaker Pattern',
      version: '1.0.0',
      totalBreakers: this.breakers.size,
      globalMetrics: this.getGlobalMetrics(),
      breakers: Array.from(this.breakers.keys())
    };
  }
}

module.exports = {
  CircuitBreaker,
  CircuitBreakerManager,
  CircuitBreakerOpenError,
  CircuitBreakerTimeoutError
};


