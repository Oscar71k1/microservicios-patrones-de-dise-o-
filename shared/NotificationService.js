/**
 * Sistema de Notificaciones - Observer Pattern
 * 
 * Servicio centralizado para manejo de notificaciones
 * Integra con EventManager para notificaciones en tiempo real
 */

const { EventManager, Observer } = require('./EventManager');

class NotificationService extends Observer {
  constructor() {
    super('NotificationService');
    this.notifications = [];
    this.subscribers = new Map(); // userId -> notification preferences
    this.channels = {
      email: new EmailChannel(),
      sms: new SMSChannel(),
      push: new PushChannel(),
      webhook: new WebhookChannel()
    };
  }

  /**
   * Suscribir usuario a notificaciones
   * @param {string} userId - ID del usuario
   * @param {Object} preferences - Preferencias de notificación
   */
  subscribeUser(userId, preferences = {}) {
    this.subscribers.set(userId, {
      email: preferences.email || false,
      sms: preferences.sms || false,
      push: preferences.push || true,
      webhook: preferences.webhook || false,
      events: preferences.events || ['all']
    });
    console.log(`🔔 Usuario ${userId} suscrito a notificaciones`);
  }

  /**
   * Desuscribir usuario de notificaciones
   * @param {string} userId - ID del usuario
   */
  unsubscribeUser(userId) {
    this.subscribers.delete(userId);
    console.log(`🔔 Usuario ${userId} desuscrito de notificaciones`);
  }

  /**
   * Actualizar preferencias de usuario
   * @param {string} userId - ID del usuario
   * @param {Object} preferences - Nuevas preferencias
   */
  updateUserPreferences(userId, preferences) {
    if (this.subscribers.has(userId)) {
      const current = this.subscribers.get(userId);
      this.subscribers.set(userId, { ...current, ...preferences });
      console.log(`🔔 Preferencias actualizadas para usuario ${userId}`);
    }
  }

  /**
   * Procesar evento y generar notificaciones
   * @param {Object} event - Evento recibido
   */
  async update(event) {
    await super.update(event);
    
    const notification = this.createNotification(event);
    if (notification) {
      this.notifications.push(notification);
      await this.deliverNotification(notification);
    }
  }

  /**
   * Crear notificación basada en evento
   * @param {Object} event - Evento
   * @returns {Object} Notificación
   */
  createNotification(event) {
    const templates = {
      'usuario.registrado': {
        title: 'Nuevo Usuario Registrado',
        message: `Usuario ${event.data.nombre} se ha registrado en el sistema`,
        type: 'info',
        priority: 'low',
        category: 'user_management'
      },
      'usuario.login': {
        title: 'Inicio de Sesión',
        message: `Usuario ${event.data.email} ha iniciado sesión`,
        type: 'info',
        priority: 'low',
        category: 'security'
      },
      'pago.creado': {
        title: 'Nueva Orden de Pago',
        message: `Se ha creado una orden de pago por $${event.data.monto}`,
        type: 'info',
        priority: 'medium',
        category: 'payment'
      },
      'pago.procesado': {
        title: 'Pago Procesado',
        message: `Pago de $${event.data.monto} ha sido procesado exitosamente`,
        type: 'success',
        priority: 'high',
        category: 'payment'
      },
      'pago.cancelado': {
        title: 'Pago Cancelado',
        message: `Pago de $${event.data.monto} ha sido cancelado`,
        type: 'warning',
        priority: 'medium',
        category: 'payment'
      },
      'concepto.creado': {
        title: 'Nuevo Concepto Creado',
        message: `Concepto "${event.data.nombre}" ha sido agregado al catálogo`,
        type: 'info',
        priority: 'low',
        category: 'catalog'
      }
    };

    const template = templates[event.type];
    if (!template) return null;

    return {
      id: this.generateNotificationId(),
      eventId: event.id,
      eventType: event.type,
      title: template.title,
      message: template.message,
      type: template.type,
      priority: template.priority,
      category: template.category,
      userId: event.data.usuarioId || event.data.userId || 'system',
      timestamp: new Date().toISOString(),
      delivered: false,
      channels: []
    };
  }

  /**
   * Entregar notificación a través de canales configurados
   * @param {Object} notification - Notificación a entregar
   */
  async deliverNotification(notification) {
    const userId = notification.userId;
    const preferences = this.subscribers.get(userId);

    if (!preferences) {
      console.log(`🔔 Usuario ${userId} no está suscrito a notificaciones`);
      return;
    }

    const deliveryPromises = [];

    // Email
    if (preferences.email && this.shouldNotify(notification, preferences)) {
      deliveryPromises.push(
        this.channels.email.send(notification, userId)
          .then(() => notification.channels.push('email'))
          .catch(error => console.error('Error enviando email:', error))
      );
    }

    // SMS
    if (preferences.sms && this.shouldNotify(notification, preferences)) {
      deliveryPromises.push(
        this.channels.sms.send(notification, userId)
          .then(() => notification.channels.push('sms'))
          .catch(error => console.error('Error enviando SMS:', error))
      );
    }

    // Push
    if (preferences.push && this.shouldNotify(notification, preferences)) {
      deliveryPromises.push(
        this.channels.push.send(notification, userId)
          .then(() => notification.channels.push('push'))
          .catch(error => console.error('Error enviando push:', error))
      );
    }

    // Webhook
    if (preferences.webhook && this.shouldNotify(notification, preferences)) {
      deliveryPromises.push(
        this.channels.webhook.send(notification, userId)
          .then(() => notification.channels.push('webhook'))
          .catch(error => console.error('Error enviando webhook:', error))
      );
    }

    await Promise.all(deliveryPromises);
    notification.delivered = true;
    
    console.log(`🔔 Notificación entregada: ${notification.title} a ${notification.channels.join(', ')}`);
  }

  /**
   * Verificar si se debe notificar según preferencias
   * @param {Object} notification - Notificación
   * @param {Object} preferences - Preferencias del usuario
   * @returns {boolean}
   */
  shouldNotify(notification, preferences) {
    if (preferences.events.includes('all')) return true;
    return preferences.events.includes(notification.eventType);
  }

  /**
   * Generar ID único para notificación
   * @returns {string} ID único
   */
  generateNotificationId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtener notificaciones de un usuario
   * @param {string} userId - ID del usuario
   * @param {number} limit - Límite de resultados
   * @returns {Array} Notificaciones
   */
  getUserNotifications(userId, limit = 50) {
    return this.notifications
      .filter(notif => notif.userId === userId)
      .slice(-limit)
      .reverse();
  }

  /**
   * Obtener estadísticas de notificaciones
   * @returns {Object} Estadísticas
   */
  getStats() {
    const total = this.notifications.length;
    const delivered = this.notifications.filter(n => n.delivered).length;
    const byType = {};
    const byPriority = {};

    this.notifications.forEach(notif => {
      byType[notif.type] = (byType[notif.type] || 0) + 1;
      byPriority[notif.priority] = (byPriority[notif.priority] || 0) + 1;
    });

    return {
      total,
      delivered,
      pending: total - delivered,
      deliveryRate: total > 0 ? (delivered / total * 100).toFixed(2) : 0,
      byType,
      byPriority,
      subscribers: this.subscribers.size
    };
  }

  /**
   * Limpiar notificaciones antiguas
   * @param {number} maxAge - Edad máxima en ms
   */
  cleanupNotifications(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 días por defecto
    const cutoff = Date.now() - maxAge;
    this.notifications = this.notifications.filter(notif => 
      new Date(notif.timestamp).getTime() > cutoff
    );
  }
}

/**
 * Canal de Email
 */
class EmailChannel {
  async send(notification, userId) {
    // Simular envío de email
    console.log(`📧 Email enviado a ${userId}: ${notification.title}`);
    return Promise.resolve();
  }
}

/**
 * Canal de SMS
 */
class SMSChannel {
  async send(notification, userId) {
    // Simular envío de SMS
    console.log(`📱 SMS enviado a ${userId}: ${notification.message}`);
    return Promise.resolve();
  }
}

/**
 * Canal de Push
 */
class PushChannel {
  async send(notification, userId) {
    // Simular envío de push notification
    console.log(`🔔 Push enviado a ${userId}: ${notification.title}`);
    return Promise.resolve();
  }
}

/**
 * Canal de Webhook
 */
class WebhookChannel {
  async send(notification, userId) {
    // Simular envío de webhook
    console.log(`🔗 Webhook enviado a ${userId}: ${notification.title}`);
    return Promise.resolve();
  }
}

module.exports = {
  NotificationService,
  EmailChannel,
  SMSChannel,
  PushChannel,
  WebhookChannel
};
