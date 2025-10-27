/**
 * @swagger
 * components:
 *   schemas:
 *     Pago:
 *       type: object
 *       required:
 *         - usuarioId
 *         - conceptoId
 *         - monto
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del pago
 *         usuarioId:
 *           type: string
 *           description: ID del usuario
 *         conceptoId:
 *           type: string
 *           description: ID del concepto a pagar
 *         monto:
 *           type: number
 *           description: Monto del pago
 *         estado:
 *           type: string
 *           enum: [pendiente, procesado, cancelado]
 *           description: Estado del pago
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { DatabaseFactory } = require('../../shared/DatabaseFactory');
const { EventManager, EventLogger, NotificationObserver, AuditObserver } = require('../../shared/EventManager');
const { CircuitBreakerManager } = require('../../shared/CircuitBreaker');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Factory Method Pattern - Crear conexión de base de datos
const db = DatabaseFactory.createConnection('pagos');
console.log('🏭 Factory Method: Conexión creada para pagos');
console.log('📊 Info de conexión:', db.getInfo());

// Observer Pattern - Crear EventManager y observers
const eventManager = new EventManager();
const eventLogger = new EventLogger();
const notificationObserver = new NotificationObserver();
const auditObserver = new AuditObserver();

// Suscribir observers a eventos
eventManager.subscribe('pago.creado', eventLogger);
eventManager.subscribe('pago.creado', auditObserver);

eventManager.subscribe('pago.procesado', eventLogger);
eventManager.subscribe('pago.procesado', notificationObserver);
eventManager.subscribe('pago.procesado', auditObserver);

eventManager.subscribe('pago.cancelado', eventLogger);
eventManager.subscribe('pago.cancelado', notificationObserver);
eventManager.subscribe('pago.cancelado', auditObserver);

console.log('👁️ Observer Pattern: EventManager configurado para pagos');
console.log('📊 Info del EventManager:', eventManager.getInfo());

// Circuit Breaker Pattern - Manager para comunicación con otros microservicios
const circuitBreakerManager = new CircuitBreakerManager();
const usuariosBreaker = circuitBreakerManager.getBreaker('usuarios', {
  failureThreshold: 3,
  timeout: 5000,
  resetTimeout: 30000,
  onStateChange: (oldState, newState) => {
    console.log(`🔒 Circuit Breaker 'usuarios': ${oldState} → ${newState}`);
  },
  onFailure: (error) => {
    console.log(`❌ Circuit Breaker 'usuarios': Failure - ${error.message}`);
  },
  onSuccess: (result) => {
    console.log(`✅ Circuit Breaker 'usuarios': Success`);
  }
});

console.log('🔒 Circuit Breaker Pattern: Circuit Breakers configurados para pagos');

// Los datos en memoria ahora se manejan a través del Factory Method
// No necesitamos pagosEnMemoria separados

// Función para validar usuario con Circuit Breaker
async function validarUsuario(usuarioId) {
  try {
    console.log(`🔍 Validando usuario: ${usuarioId}`);
    
    // Usar Circuit Breaker para proteger la comunicación
    const response = await usuariosBreaker.execute(async () => {
      return await axios.get(`http://localhost:3001/validar/${usuarioId}`);
    });
    
    console.log('✅ Respuesta de validación:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al validar usuario:', error.message);
    console.error('❌ Error completo:', error);
    
    // Manejar errores del Circuit Breaker
    if (error.name === 'CircuitBreakerOpenError') {
      console.log('🔒 Circuit Breaker abierto para usuarios, usando fallback');
      return { 
        existe: false, 
        error: 'Servicio de usuarios temporalmente no disponible',
        fallback: true
      };
    }
    
    // Manejar errores de axios
    if (error.response) {
      console.error('❌ Status:', error.response.status);
      console.error('❌ Data:', error.response.data);
      return { 
        existe: false, 
        error: 'No se pudo validar el usuario',
        detalles: error.response.data?.error || error.message
      };
    }
    
    // Manejar otros errores
    return { 
      existe: false, 
      error: 'No se pudo validar el usuario',
      detalles: error.message
    };
  }
}

// Función para generar ID único
function generarId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Rutas del microservicio de pagos

// Ruta de salud del microservicio (DEBE ir al principio)
app.get('/health', (req, res) => {
  res.json({
    mensaje: 'Microservicio de Pagos funcionando',
    timestamp: new Date().toISOString(),
    puerto: PORT,
    patterns: ['Factory Method', 'Observer Pattern', 'Circuit Breaker'],
    eventManager: eventManager.getInfo(),
    circuitBreakers: circuitBreakerManager.getInfo()
  });
});

// Ruta de estadísticas de eventos
app.get('/events/stats', (req, res) => {
  res.json({
    mensaje: 'Estadísticas de eventos del microservicio de pagos',
    stats: eventManager.getStats(),
    timestamp: new Date().toISOString()
  });
});

// Ruta de historial de eventos
app.get('/events/history', (req, res) => {
  const { type, limit = 50 } = req.query;
  const history = eventManager.getEventHistory(type, parseInt(limit));
  
  res.json({
    mensaje: 'Historial de eventos',
    events: history,
    total: history.length,
    timestamp: new Date().toISOString()
  });
});

// Ruta de estado de Circuit Breakers
app.get('/circuit-breakers', (req, res) => {
  res.json({
    mensaje: 'Estado de Circuit Breakers del microservicio de pagos',
    circuitBreakers: circuitBreakerManager.getGlobalMetrics(),
    breakers: circuitBreakerManager.getAllStates(),
    timestamp: new Date().toISOString()
  });
});

/**
 * @swagger
 * /crear:
 *   post:
 *     summary: Crear nueva orden de pago
 *     tags: [Pagos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuarioId
 *               - concepto
 *               - monto
 *             properties:
 *               usuarioId:
 *                 type: string
 *                 description: ID del usuario
 *               concepto:
 *                 type: string
 *                 description: Concepto del pago
 *               monto:
 *                 type: number
 *                 description: Monto a pagar
 *     responses:
 *       201:
 *         description: Orden de pago creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 orden:
 *                   $ref: '#/components/schemas/Pago'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
app.post('/crear', async (req, res) => {
  try {
    const { usuarioId, concepto, monto } = req.body;

    // Validaciones básicas
    if (!usuarioId || !concepto || !monto) {
      return res.status(400).json({ 
        error: 'UsuarioId, concepto y monto son requeridos' 
      });
    }

    if (monto <= 0) {
      return res.status(400).json({ 
        error: 'El monto debe ser mayor a 0' 
      });
    }

    // Validar que el usuario existe (comunicación con microservicio de usuarios)
    const validacionUsuario = await validarUsuario(usuarioId);
    if (!validacionUsuario.existe) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado',
        detalles: validacionUsuario.mensaje || 'El usuario no existe en el sistema'
      });
    }

    // Crear nueva orden de pago
    const nuevaOrden = {
      usuarioId,
      concepto,
      monto: parseFloat(monto),
      estado: 'Pendiente',
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    };

    // Guardar orden usando Factory Method (funciona con Firebase y Memoria)
      const docRef = await db.collection('pagos').add(nuevaOrden);
    const ordenId = docRef.id;

    // Observer Pattern - Notificar evento de pago creado
    await eventManager.notify('pago.creado', {
      source: 'pagos',
      ordenId,
      usuarioId,
      concepto,
      monto,
      estado: 'Pendiente',
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      mensaje: 'Orden de pago creada exitosamente',
      orden: {
        id: ordenId,
        ...nuevaOrden
      }
    });

  } catch (error) {
    console.error('Error al crear orden de pago:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener pagos de un usuario específico
app.get('/usuario/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    console.log(`🔍 Buscando pagos para usuario: ${usuarioId}`);

    // Validar que el usuario existe
    const validacionUsuario = await validarUsuario(usuarioId);
    console.log('✅ Validación de usuario:', validacionUsuario);
    
    if (!validacionUsuario.existe) {
      console.log('❌ Usuario no encontrado:', usuarioId);
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    // Obtener pagos usando Factory Method
      const pagosRef = db.collection('pagos');
      const querySnapshot = await pagosRef
        .where('usuarioId', '==', usuarioId)
        .orderBy('fechaCreacion', 'desc')
        .get();
      
    const pagos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    console.log('📋 Pagos encontrados:', pagos.length);
    res.json({
      mensaje: 'Pagos obtenidos exitosamente',
      usuario: validacionUsuario.usuario,
      pagos,
      total: pagos.length
    });

  } catch (error) {
    console.error('❌ Error al obtener pagos:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detalles: error.message,
      usuarioId: req.params.usuarioId
    });
  }
});


// Obtener pago específico por ID (DEBE ir después de las rutas específicas)
app.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener pago usando Factory Method
      const doc = await db.collection('pagos').doc(id).get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'Pago no encontrado' });
      }
    const pago = { id: doc.id, ...doc.data() };

    // Validar que el usuario existe
    const validacionUsuario = await validarUsuario(pago.usuarioId);
    if (!validacionUsuario.existe) {
      return res.status(404).json({ 
        error: 'Usuario asociado al pago no encontrado' 
      });
    }

    res.json({
      mensaje: 'Pago obtenido exitosamente',
      pago,
      usuario: validacionUsuario.usuario
    });

  } catch (error) {
    console.error('Error al obtener pago:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar estado de pago
app.put('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado || !['Pendiente', 'Pagado', 'Cancelado'].includes(estado)) {
      return res.status(400).json({ 
        error: 'Estado inválido. Debe ser: Pendiente, Pagado o Cancelado' 
      });
    }

    // Obtener y actualizar pago usando Factory Method
      const doc = await db.collection('pagos').doc(id).get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'Pago no encontrado' });
      }
      
    // Actualizar estado (esto funcionará tanto en Firebase como en Memoria)
      await db.collection('pagos').doc(id).update({
        estado,
        fechaActualizacion: new Date().toISOString()
      });
      
    const pago = { id: doc.id, ...doc.data(), estado };

    // Observer Pattern - Notificar evento según el estado
    const eventType = estado === 'Pagado' ? 'pago.procesado' : 
                     estado === 'Cancelado' ? 'pago.cancelado' : null;
    
    if (eventType) {
      await eventManager.notify(eventType, {
        source: 'pagos',
        ordenId: id,
        usuarioId: pago.usuarioId,
        concepto: pago.concepto,
        monto: pago.monto,
        estado,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      mensaje: 'Estado de pago actualizado exitosamente',
      pago
    });

  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener todos los pagos (para administradores)
app.get('/', async (req, res) => {
  try {
    // Obtener todos los pagos usando Factory Method
      const pagosRef = db.collection('pagos');
      const querySnapshot = await pagosRef
        .orderBy('fechaCreacion', 'desc')
        .get();
      
    const pagos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

    // Obtener información de usuarios para cada pago
    const pagosConUsuarios = await Promise.all(
      pagos.map(async (pago) => {
        const validacionUsuario = await validarUsuario(pago.usuarioId);
        return {
          ...pago,
          usuario: validacionUsuario.existe ? validacionUsuario.usuario : null
        };
      })
    );

    res.json({
      mensaje: 'Todos los pagos obtenidos exitosamente',
      pagos: pagosConUsuarios,
      total: pagos.length
    });

  } catch (error) {
    console.error('Error al obtener todos los pagos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// Limpiar historial de eventos cada hora
setInterval(() => {
  eventManager.cleanupHistory();
}, 60 * 60 * 1000);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`💳 Microservicio de Pagos ejecutándose en puerto ${PORT}`);
  console.log(`🏭 Factory Method: ${db.getInfo().type}`);
  console.log(`👁️ Observer Pattern: ${eventManager.getInfo().observersCount} observers activos`);
  console.log(`🔒 Circuit Breaker: ${circuitBreakerManager.getGlobalMetrics().totalBreakers} breakers activos`);
  console.log(`🔗 Endpoints disponibles:`);
  console.log(`   - POST /crear - Crear orden de pago`);
  console.log(`   - GET /usuario/:usuarioId - Pagos de usuario`);
  console.log(`   - GET /:id - Obtener pago específico`);
  console.log(`   - PUT /:id/estado - Actualizar estado`);
  console.log(`   - GET / - Todos los pagos`);
  console.log(`   - GET /health - Estado del servicio`);
  console.log(`   - GET /events/stats - Estadísticas de eventos`);
  console.log(`   - GET /events/history - Historial de eventos`);
  console.log(`   - GET /circuit-breakers - Estado de Circuit Breakers`);
});

