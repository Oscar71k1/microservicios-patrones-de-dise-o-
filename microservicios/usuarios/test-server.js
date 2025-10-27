const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock del DatabaseFactory
const mockDb = {
  collection: jest.fn().mockReturnValue({
    add: jest.fn().mockResolvedValue({ id: '1' }),
    where: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({
        empty: false,
        docs: [{
          id: '1',
          data: () => ({
            nombre: 'Test User',
            email: 'test@test.com',
            rol: 'Alumno',
            contraseña: 'hashedpassword'
          })
        }]
      })
    })
  }),
  getInfo: () => ({ type: 'Memory' })
};

// Mock del EventManager
const mockEventManager = {
  notify: jest.fn(),
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
  getInfo: () => ({
    pattern: 'Observer Pattern',
    observersCount: 3
  }),
  getStats: () => ({
    totalEvents: 0,
    eventTypes: ['usuario.registrado', 'usuario.login'],
    eventCounts: {},
    observersCount: 3,
    lastEvent: null
  })
};

// Función para generar token JWT
function generarToken(payload) {
  const secret = process.env.JWT_SECRET || 'test-secret';
  return jwt.sign(payload, secret, { expiresIn: '24h' });
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
    const secret = process.env.JWT_SECRET || 'test-secret';
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

// Rutas del microservicio de usuarios

// Health check
app.get('/health', (req, res) => {
  res.json({
    mensaje: 'Microservicio de Usuarios funcionando',
    timestamp: new Date().toISOString(),
    puerto: 3001,
    patterns: ['Factory Method', 'Observer Pattern'],
    eventManager: mockEventManager.getInfo()
  });
});

// Registro de nuevo usuario
app.post('/registro', async (req, res) => {
  try {
    const { nombre, email, contraseña, rol, carrera, campus } = req.body;

    if (!nombre || !email || !contraseña || !rol) {
      return res.status(400).json({ 
        error: 'Nombre, email, contraseña y rol son requeridos' 
      });
    }

    // Simular creación de usuario
    const usuario = {
      id: '1',
      nombre,
      email,
      rol,
      matricula: 'GENXX20250001'
    };

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario
    });
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Login de usuario
app.post('/login', async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
    }

    // Simular login exitoso
    if (email === 'test@test.com' && contraseña === '123456') {
      const token = generarToken({ id: '1', email: 'test@test.com', rol: 'Alumno' });
      res.json({
        mensaje: 'Login exitoso',
        token,
        usuario: {
          id: '1',
          nombre: 'Test User',
          email: 'test@test.com',
          rol: 'Alumno'
        }
      });
    } else {
      res.status(401).json({ error: 'Credenciales inválidas' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Validar existencia de usuario
app.get('/validar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const usuariosRef = mockDb.collection('usuarios');
    const querySnapshot = await usuariosRef.where('id', '==', id).get();
    
    if (querySnapshot.empty) {
      return res.status(404).json({ 
        existe: false, 
        mensaje: 'Usuario no encontrado' 
      });
    }
    
    const doc = querySnapshot.docs[0];
    const usuario = { id: doc.id, ...doc.data() };
    
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
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener perfil de usuario
app.get('/perfil/:id', autenticarToken, async (req, res) => {
  try {
    const { id } = req.params;

    const usuariosRef = mockDb.collection('usuarios');
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
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = app;
