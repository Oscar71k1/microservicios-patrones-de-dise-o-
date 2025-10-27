/**
 * @swagger
 * components:
 *   schemas:
 *     Concepto:
 *       type: object
 *       required:
 *         - nombre
 *         - descripcion
 *         - monto
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del concepto
 *         nombre:
 *           type: string
 *           description: Nombre del concepto
 *         descripcion:
 *           type: string
 *           description: Descripción del concepto
 *         monto:
 *           type: number
 *           description: Monto del concepto
 *         tipo:
 *           type: string
 *           enum: [academico, financiero]
 *           description: Tipo de concepto
 *         activo:
 *           type: boolean
 *           description: Si el concepto está activo
 */

const express = require('express');
const cors = require('cors');
const { DatabaseFactory } = require('../../shared/DatabaseFactory');
const { EventManager, EventLogger, NotificationObserver, AuditObserver } = require('../../shared/EventManager');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(cors());
app.use(express.json());

// Factory Method Pattern - Crear conexión de base de datos
const db = DatabaseFactory.createConnection('catalogo');
console.log('🏭 Factory Method: Conexión creada para catálogo');
console.log('📊 Info de conexión:', db.getInfo());

// Observer Pattern - Crear EventManager y observers
const eventManager = new EventManager();
const eventLogger = new EventLogger();
const notificationObserver = new NotificationObserver();
const auditObserver = new AuditObserver();

// Suscribir observers a eventos
eventManager.subscribe('concepto.creado', eventLogger);
eventManager.subscribe('concepto.creado', notificationObserver);
eventManager.subscribe('concepto.creado', auditObserver);

eventManager.subscribe('concepto.actualizado', eventLogger);
eventManager.subscribe('concepto.actualizado', auditObserver);

console.log('👁️ Observer Pattern: EventManager configurado para catálogo');
console.log('📊 Info del EventManager:', eventManager.getInfo());

// Los datos en memoria ahora se manejan a través del Factory Method
// No necesitamos conceptosEnMemoria separados

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Catálogo',
    timestamp: new Date().toISOString(),
    port: PORT,
    patterns: ['Factory Method', 'Observer Pattern'],
    eventManager: eventManager.getInfo()
  });
});

// Ruta de estadísticas de eventos
app.get('/events/stats', (req, res) => {
  res.json({
    mensaje: 'Estadísticas de eventos del microservicio de catálogo',
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

// Obtener conceptos con filtros
app.get('/conceptos', async (req, res) => {
  try {
    const { tenantId = 'universidad_principal', carrera, campus, periodo, activo } = req.query;

    // Convertir a boolean, con true como valor por defecto
    const activoBool = activo === undefined ? true : activo === 'true';

    console.log('🔍 Filtros recibidos:', { tenantId, carrera, campus, periodo, activoBool });

    // Obtener conceptos usando Factory Method
    const conceptosRef = db.collection('conceptos');
    const querySnapshot = await conceptosRef
      .where('tenantId', '==', tenantId)
      .where('activo', '==', activoBool)
      .get();
    
    let conceptos = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    if (carrera && carrera !== 'Todas') {
      console.log('🔍 Filtrando por carrera:', carrera);
      conceptos = conceptos.filter(concepto =>
        concepto.carrera === carrera || concepto.carrera === 'Todas'
      );
      console.log('📋 Conceptos después del filtro de carrera:', conceptos.length);
    }

    if (campus && campus !== 'Todos') {
      conceptos = conceptos.filter(concepto =>
        concepto.campus === campus || concepto.campus === 'Todos'
      );
    }

    if (periodo) {
      conceptos = conceptos.filter(concepto => concepto.periodo === periodo);
    }

    res.json({
      mensaje: 'Conceptos obtenidos exitosamente',
      conceptos,
      total: conceptos.length,
      filtros: { tenantId, carrera, campus, periodo, activo: activoBool }
    });

  } catch (error) {
    console.error('Error al obtener conceptos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear concepto específico para alumno
app.post('/conceptos/alumno', async (req, res) => {
  try {
    const {
      matricula,
      nombre,
      descripcion,
      monto,
      tipo = 'Obligatorio',
      periodo = 'Semestral',
      tenantId = 'universidad_principal'
    } = req.body;

    if (!matricula || !nombre || !monto) {
      return res.status(400).json({
        error: 'Matrícula, nombre y monto son requeridos'
      });
    }

    // Crear concepto específico para el alumno
    const nuevoConcepto = {
      codigo: `ALUM-${matricula}-${Date.now()}`,
      nombre: `${nombre} - ${matricula}`,
      descripcion: descripcion || `Concepto específico para matrícula ${matricula}`,
      monto: parseFloat(monto),
      tipo,
      vigencia: {
        inicio: new Date().toISOString().split('T')[0],
        fin: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      periodo,
      modalidad: 'Presencial',
      turno: 'Cualquiera',
      carrera: 'Específico',
      campus: 'Específico',
      matricula: matricula,
      tenantId,
      activo: true,
      fechaCreacion: new Date().toISOString()
    };

    // Guardar concepto usando Factory Method
    const docRef = await db.collection('conceptos').add(nuevoConcepto);
    const conceptoId = docRef.id;

    // Observer Pattern - Notificar evento de concepto creado
    await eventManager.notify('concepto.creado', {
      source: 'catalogo',
      conceptoId,
      codigo: nuevoConcepto.codigo,
      nombre: nuevoConcepto.nombre,
      descripcion: nuevoConcepto.descripcion,
      monto: nuevoConcepto.monto,
      tipo: nuevoConcepto.tipo,
      matricula,
      tenantId,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      mensaje: 'Concepto creado exitosamente para el alumno',
      concepto: { id: conceptoId, ...nuevoConcepto }
    });

  } catch (error) {
    console.error('Error al crear concepto para alumno:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener concepto por ID
app.get('/conceptos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Obtener concepto usando Factory Method
    const doc = await db.collection('conceptos').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Concepto no encontrado' });
    }
    const concepto = { id: doc.id, ...doc.data() };
    
    res.json(concepto);
  } catch (error) {
    console.error('Error al obtener concepto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Limpiar historial de eventos cada hora
setInterval(() => {
  eventManager.cleanupHistory();
}, 60 * 60 * 1000);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Microservicio Catálogo ejecutándose en puerto ${PORT}`);
  console.log(`🏭 Factory Method: ${db.getInfo().type}`);
  console.log(`👁️ Observer Pattern: ${eventManager.getInfo().observersCount} observers activos`);
  console.log(`📊 Endpoints disponibles:`);
  console.log(`   - GET /conceptos - Obtener conceptos con filtros`);
  console.log(`   - POST /conceptos/alumno - Crear concepto para alumno`);
  console.log(`   - GET /conceptos/:id - Obtener concepto por ID`);
  console.log(`   - GET /health - Estado del servicio`);
  console.log(`   - GET /events/stats - Estadísticas de eventos`);
  console.log(`   - GET /events/history - Historial de eventos`);
});