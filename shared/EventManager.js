/**
 * Observer Pattern - EventManager
 * 
 * Sistema de eventos para comunicación entre microservicios
 * Permite desacoplamiento y notificaciones en tiempo real
 */

class EventManager {
  constructor() {
    this.observers = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 1000;
    console.log('👁️ Observer Pattern: EventManager inicializado');
  }

  /**
   * Suscribir un observer a un evento
   * @param {string} eventType - Tipo de evento
   * @param {Observer} observer - Observer a suscribir
   */
  subscribe(eventType, observer) {
    if (!this.observers.has(eventType)) {
      this.observers.set(eventType, []);
    }
    
    this.observers.get(eventType).push(observer);
    console.log(`👁️ Observer suscrito a evento: ${eventType} - ${observer.constructor.name}`);
  }

  /**
   * Desuscribir un observer de un evento
   * @param {string} eventType - Tipo de evento
   * @param {Observer} observer - Observer a desuscribir
   */
  unsubscribe(eventType, observer) {
    if (!this.observers.has(eventType)) return;
    
    const observers = this.observers.get(eventType);
    const index = observers.indexOf(observer);
    
    if (index > -1) {
      observers.splice(index, 1);
      console.log(`👁️ Observer desuscrito de evento: ${eventType} - ${observer.constructor.name}`);
    }
  }

  /**
   * Notificar a todos los observers de un evento
   * @param {string} eventType - Tipo de evento
   * @param {Object} eventData - Datos del evento
   */
  async notify(eventType, eventData) {
    console.log(`📢 Notificando evento: ${eventType}`, eventData);
    
    const event = {
      id: this.generateEventId(),
      type: eventType,
      data: eventData,
      timestamp: new Date().toISOString(),
      source: eventData.source || 'unknown'
    };

    // Agregar a historial
    this.addToHistory(event);

    // Notificar a observers
    const observers = this.observers.get(eventType) || [];
    const notifications = observers.map(async (observer) => {
      try {
        await observer.update(event);
        console.log(`✅ Observer notificado: ${observer.constructor.name} - ${eventType}`);
      } catch (error) {
        console.error(`❌ Error notificando observer: ${observer.constructor.name}`, error);
      }
    });

    await Promise.all(notifications);
    
    console.log(`📢 Evento ${eventType} notificado a ${observers.length} observers`);
  }

  /**
   * Agregar evento al historial
   * @param {Object} event - Evento a agregar
   */
  addToHistory(event) {
    this.eventHistory.push(event);
    
    // Mantener tamaño máximo del historial
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Generar ID único para evento
   * @returns {string} ID único
   */
  generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtener historial de eventos
   * @param {string} eventType - Filtrar por tipo (opcional)
   * @param {number} limit - Límite de resultados (opcional)
   * @returns {Array} Historial de eventos
   */
  getEventHistory(eventType = null, limit = 50) {
    let events = this.eventHistory;
    
    if (eventType) {
      events = events.filter(event => event.type === eventType);
    }
    
    return events.slice(-limit);
  }

  /**
   * Obtener estadísticas de eventos
   * @returns {Object} Estadísticas
   */
  getStats() {
    const eventTypes = [...this.observers.keys()];
    const eventCounts = {};
    
    this.eventHistory.forEach(event => {
      eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
    });

    return {
      totalEvents: this.eventHistory.length,
      eventTypes: eventTypes,
      eventCounts: eventCounts,
      observersCount: Array.from(this.observers.values()).reduce((sum, obs) => sum + obs.length, 0),
      lastEvent: this.eventHistory[this.eventHistory.length - 1] || null
    };
  }

  /**
   * Limpiar historial de eventos
   * @param {number} maxAge - Edad máxima en ms
   */
  cleanupHistory(maxAge = 24 * 60 * 60 * 1000) { // 24 horas por defecto
    const cutoff = Date.now() - maxAge;
    this.eventHistory = this.eventHistory.filter(event => 
      new Date(event.timestamp).getTime() > cutoff
    );
  }

  /**
   * Obtener información del EventManager
   * @returns {Object} Información
   */
  getInfo() {
    return {
      pattern: 'Observer Pattern',
      version: '1.0.0',
      eventTypes: [...this.observers.keys()],
      observersCount: Array.from(this.observers.values()).reduce((sum, obs) => sum + obs.length, 0),
      historySize: this.eventHistory.length,
      stats: this.getStats()
    };
  }
}

/**
 * Clase base Observer
 */
class Observer {
  constructor(name) {
    this.name = name;
    this.lastUpdate = null;
  }

  /**
   * Método que se ejecuta cuando se notifica un evento
   * @param {Object} event - Evento recibido
   */
  async update(event) {
    this.lastUpdate = new Date().toISOString();
    console.log(`👁️ ${this.name} recibió evento: ${event.type}`);
  }

  /**
   * Obtener información del observer
   * @returns {Object} Información
   */
  getInfo() {
    return {
      name: this.name,
      lastUpdate: this.lastUpdate,
      type: this.constructor.name
    };
  }
}

/**
 * Observer para Logging de Eventos
 */
class EventLogger extends Observer {
  constructor() {
    super('EventLogger');
    this.logs = [];
  }

  async update(event) {
    await super.update(event);
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      eventId: event.id,
      eventType: event.type,
      source: event.source,
      data: event.data
    };
    
    this.logs.push(logEntry);
    console.log(`📝 EventLogger: Registrado evento ${event.type} de ${event.source}`);
  }

  getLogs(limit = 100) {
    return this.logs.slice(-limit);
  }
}

/**
 * Observer para Notificaciones
 */
class NotificationObserver extends Observer {
  constructor() {
    super('NotificationObserver');
    this.notifications = [];
  }

  async update(event) {
    await super.update(event);
    
    // Generar notificación según el tipo de evento
    const notification = this.generateNotification(event);
    if (notification) {
      this.notifications.push(notification);
      console.log(`🔔 Notificación generada: ${notification.title}`);
    }
  }

  generateNotification(event) {
    const notifications = {
      'usuario.registrado': {
        title: 'Nuevo Usuario Registrado',
        message: `Usuario ${event.data.nombre} se ha registrado`,
        type: 'info',
        priority: 'low'
      },
      'pago.procesado': {
        title: 'Pago Procesado',
        message: `Pago de $${event.data.monto} procesado exitosamente`,
        type: 'success',
        priority: 'high'
      },
      'concepto.creado': {
        title: 'Nuevo Concepto Creado',
        message: `Concepto ${event.data.nombre} agregado al catálogo`,
        type: 'info',
        priority: 'medium'
      }
    };

    return notifications[event.type] || null;
  }

  getNotifications(limit = 50) {
    return this.notifications.slice(-limit);
  }
}

/**
 * Observer para Auditoría
 */
class AuditObserver extends Observer {
  constructor() {
    super('AuditObserver');
    this.auditLog = [];
  }

  async update(event) {
    await super.update(event);
    
    const auditEntry = {
      timestamp: new Date().toISOString(),
      eventId: event.id,
      eventType: event.type,
      source: event.source,
      action: this.getActionFromEvent(event),
      details: event.data,
      severity: this.getSeverityFromEvent(event)
    };
    
    this.auditLog.push(auditEntry);
    console.log(`🔍 AuditObserver: Registrado ${auditEntry.action} de ${event.source}`);
  }

  getActionFromEvent(event) {
    const actions = {
      'usuario.registrado': 'USER_REGISTRATION',
      'usuario.login': 'USER_LOGIN',
      'pago.procesado': 'PAYMENT_PROCESSED',
      'pago.cancelado': 'PAYMENT_CANCELLED',
      'concepto.creado': 'CONCEPT_CREATED',
      'concepto.actualizado': 'CONCEPT_UPDATED'
    };
    
    return actions[event.type] || 'UNKNOWN_ACTION';
  }

  getSeverityFromEvent(event) {
    const severities = {
      'usuario.registrado': 'INFO',
      'usuario.login': 'INFO',
      'pago.procesado': 'HIGH',
      'pago.cancelado': 'MEDIUM',
      'concepto.creado': 'INFO',
      'concepto.actualizado': 'INFO'
    };
    
    return severities[event.type] || 'LOW';
  }

  getAuditLog(limit = 200) {
    return this.auditLog.slice(-limit);
  }
}

module.exports = {
  EventManager,
  Observer,
  EventLogger,
  NotificationObserver,
  AuditObserver
};


