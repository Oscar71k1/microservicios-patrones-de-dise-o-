/**
 * @fileoverview Microservicio de Usuarios
 * @description Sistema de gestión de usuarios con patrones de diseño:
 * - Factory Method Pattern (DatabaseFactory)
 * - Observer Pattern (EventManager)
 * - JWT Authentication
 * @author Sistema de Microservicios
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { DatabaseFactory } = require('../../shared/DatabaseFactory');
const { EventManager, EventLogger, NotificationObserver, AuditObserver } = require('../../shared/EventManager');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware de logging para debug
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  console.log(`📥 Headers:`, req.headers['content-type']);
  console.log(`📥 Body:`, req.body);
  next();
});

// Función para generar matrícula
function generateMatricula(carrera, campus) {
  const año = new Date().getFullYear();
  const prefijoCarrera = {
    'Ingeniería': 'ING',
    'Medicina': 'MED',
    'Administración': 'ADM',
    'Derecho': 'DER',
    'Psicología': 'PSI',
    'Contaduría': 'CON',
    'Arquitectura': 'ARQ'
  };
  const prefijoCampus = {
    'Campus Principal': 'CP',
    'Campus Sur': 'CS'
  };
  
  const carreraCode = prefijoCarrera[carrera] || 'GEN';
  const campusCode = prefijoCampus[campus] || 'XX';
  const numero = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  
  return `${carreraCode}${campusCode}${año}${numero}`;
}

// Factory Method Pattern - Crear conexión de base de datos
const db = DatabaseFactory.createConnection('usuarios');
console.log('🏭 Factory Method: Conexión creada para usuarios');
console.log('📊 Info de conexión:', db.getInfo());

// Observer Pattern - Crear EventManager y observers
const eventManager = new EventManager();
const eventLogger = new EventLogger();
const notificationObserver = new NotificationObserver();
const auditObserver = new AuditObserver();

// Suscribir observers a eventos
eventManager.subscribe('usuario.registrado', eventLogger);
eventManager.subscribe('usuario.registrado', notificationObserver);
eventManager.subscribe('usuario.registrado', auditObserver);

eventManager.subscribe('usuario.login', eventLogger);
eventManager.subscribe('usuario.login', auditObserver);

console.log('👁️ Observer Pattern: EventManager configurado para usuarios');
console.log('📊 Info del EventManager:', eventManager.getInfo());

// Los datos en memoria ahora se manejan a través del Factory Method
// No necesitamos usuariosEnMemoria separados

// Función para generar token JWT
function generarToken(payload) {
  const secret = process.env.JWT_SECRET || 'clave-secreta-desarrollo';
  console.log('🔐 Generando token con secret:', secret.substring(0, 10) + '...');
  console.log('🔐 Payload:', payload);
  
  const token = jwt.sign(payload, secret, {
    expiresIn: '24h'
  });
  
  console.log('🔐 Token generado:', token.substring(0, 50) + '...');
  return token;
}

// Middleware de autenticación
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Token de acceso requerido',
      message: 'Debe proporcionar un token de autenticación'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'clave-secreta-desarrollo';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Token inválido',
      message: 'El token proporcionado no es válido o ha expirado'
    });
  }
}

// Catálogo de tenants
let tenantsEnMemoria = [
  {
    id: 'universidad_principal',
    nombre: 'Universidad Principal',
    dominio: 'universidad.edu.mx',
    campus: 'Campus Principal',
    activo: true
  },
  {
    id: 'campus_sur',
    nombre: 'Campus Sur',
    dominio: 'sur.universidad.edu.mx',
    campus: 'Campus Sur',
    activo: true
  }
];

// Función duplicada eliminada - usar la función generarToken existente

// Función duplicada eliminada - usar la función autenticarToken existente

// Rutas del microservicio de usuarios

// Registro de nuevo usuario
app.post('/registro', async (req, res) => {
  try {
    const { nombre, email, contraseña, rol = 'Alumno', tenantId = 'universidad_principal', campus, carrera } = req.body;

    // Validaciones básicas
    if (!nombre || !email || !contraseña) {
      return res.status(400).json({ 
        error: 'Nombre, email y contraseña son requeridos' 
      });
    }

    // Verificar si el usuario ya existe usando Factory Method
      const usuariosRef = db.collection('usuarios');
      const querySnapshot = await usuariosRef.where('email', '==', email).get();
    const usuarioExistente = !querySnapshot.empty;

    if (usuarioExistente) {
      return res.status(400).json({ 
        error: 'El usuario ya existe con este email' 
      });
    }

    // Encriptar contraseña
    const contraseñaEncriptada = await bcrypt.hash(contraseña, 10);

    // Generar matrícula automática
    const matricula = generateMatricula(carrera, campus);
    
    // Crear nuevo usuario
    const nuevoUsuario = {
      nombre,
      email,
      contraseña: contraseñaEncriptada,
      rol,
      tenantId,
      campus: campus || 'Campus Principal',
      carrera: carrera || 'Sin especificar',
      matricula: matricula,
      fechaCreacion: new Date().toISOString()
    };

    // Guardar usuario usando Factory Method (funciona con Firebase y Memoria)
      const docRef = await db.collection('usuarios').add(nuevoUsuario);
    const usuarioId = docRef.id;

    // Generar token JWT
    const token = generarToken({ id: usuarioId, email, rol });

    // Observer Pattern - Notificar evento de registro
    await eventManager.notify('usuario.registrado', {
      source: 'usuarios',
      usuarioId,
      nombre,
      email,
      rol,
      tenantId,
      campus,
      carrera,
      matricula
    });

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: {
        id: usuarioId,
        nombre,
        email,
        rol
      },
      token
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login de usuario
app.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body);
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
      console.log('❌ Login error: Missing email or password');
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
    }

    // Buscar usuario usando Factory Method
    console.log('🔍 Searching user in database...');
    const usuariosRef = db.collection('usuarios');
    const querySnapshot = await usuariosRef.where('email', '==', email).get();
    
    console.log('🔍 Query result:', querySnapshot.empty ? 'No user found' : 'User found');
    
    if (querySnapshot.empty) {
      console.log('❌ Login error: User not found');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const doc = querySnapshot.docs[0];
    const usuario = { id: doc.id, ...doc.data() };
    console.log('👤 User found:', { id: usuario.id, email: usuario.email, rol: usuario.rol });

    // Verificar contraseña
    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!contraseñaValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = generarToken({ 
      id: usuario.id, 
      email: usuario.email, 
      rol: usuario.rol 
    });

    // Observer Pattern - Notificar evento de login
    await eventManager.notify('usuario.login', {
      source: 'usuarios',
      usuarioId: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      timestamp: new Date().toISOString()
    });

    res.json({
      mensaje: 'Login exitoso',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      },
      token
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
});

// Obtener perfil de usuario (requiere autenticación)
app.get('/perfil/:id', autenticarToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener usuario usando Factory Method
    const usuariosRef = db.collection('usuarios');
    const querySnapshot = await usuariosRef.where('id', '==', id).get();
    
    if (querySnapshot.empty) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const doc = querySnapshot.docs[0];
    const usuario = { id: doc.id, ...doc.data() };

    // No devolver la contraseña
    delete usuario.contraseña;

    res.json({
      mensaje: 'Perfil obtenido exitosamente',
      usuario
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Validar existencia de usuario (para otros microservicios)
app.get('/validar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Validando usuario ID:', id);

    // Validar usuario usando Factory Method
    const usuariosRef = db.collection('usuarios');
    const querySnapshot = await usuariosRef.where('id', '==', id).get();
    
    if (querySnapshot.empty) {
      console.log('❌ Usuario no encontrado:', id);
      return res.status(404).json({ 
        existe: false, 
        mensaje: 'Usuario no encontrado' 
      });
    }
    
    const doc = querySnapshot.docs[0];
    const usuario = { id: doc.id, ...doc.data() };
    console.log('✅ Usuario encontrado:', { id: usuario.id, email: usuario.email });

    // No devolver la contraseña
    delete usuario.contraseña;

    res.json({
      existe: true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('Error al validar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener lista de tenants
app.get('/tenants', (req, res) => {
  res.json({
    mensaje: 'Tenants obtenidos exitosamente',
    tenants: tenantsEnMemoria
  });
});

// Ruta de salud del microservicio
app.get('/health', (req, res) => {
  res.json({
    mensaje: 'Microservicio de Usuarios funcionando',
    timestamp: new Date().toISOString(),
    puerto: PORT,
    patterns: ['Factory Method', 'Observer Pattern'],
    eventManager: eventManager.getInfo()
  });
});

// Ruta de estadísticas de eventos
app.get('/events/stats', (req, res) => {
  res.json({
    mensaje: 'Estadísticas de eventos del microservicio de usuarios',
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

// Limpiar historial de eventos cada hora
setInterval(() => {
  eventManager.cleanupHistory();
}, 60 * 60 * 1000);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`👤 Microservicio de Usuarios ejecutándose en puerto ${PORT}`);
  console.log(`🏭 Factory Method: ${db.getInfo().type}`);
  console.log(`👁️ Observer Pattern: ${eventManager.getInfo().observersCount} observers activos`);
  console.log(`🔐 Endpoints disponibles:`);
  console.log(`   - POST /registro - Registro de usuario`);
  console.log(`   - POST /login - Autenticación`);
  console.log(`   - GET /perfil/:id - Obtener perfil`);
  console.log(`   - GET /validar/:id - Validar usuario`);
  console.log(`   - GET /health - Estado del servicio`);
  console.log(`   - GET /events/stats - Estadísticas de eventos`);
  console.log(`   - GET /events/history - Historial de eventos`);
});

// Exportar app para testing
module.exports = app;
