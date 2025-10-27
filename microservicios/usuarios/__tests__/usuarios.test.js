const request = require('supertest');
const jwt = require('jsonwebtoken');

// Importar el servidor de prueba
const app = require('../test-server');

describe('Microservicio de Usuarios', () => {
  beforeAll(() => {
    // Configurar variables de entorno para pruebas
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('GET /health', () => {
    test('should return 200 and health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body.mensaje).toBe('Microservicio de Usuarios funcionando');
      expect(response.body.puerto).toBe(3001);
      expect(response.body.patterns).toContain('Factory Method');
      expect(response.body.patterns).toContain('Observer Pattern');
    });
  });

  describe('POST /registro', () => {
    test('should create user with valid data', async () => {
      const userData = {
        nombre: 'Test User',
        email: 'test@test.com',
        contraseña: '123456',
        rol: 'Alumno',
        carrera: 'Ingeniería',
        campus: 'Campus Principal'
      };
      
      const response = await request(app)
        .post('/registro')
        .send(userData)
        .expect(201);
      
      expect(response.body.mensaje).toBe('Usuario registrado exitosamente');
      expect(response.body.usuario.email).toBe('test@test.com');
      expect(response.body.usuario.matricula).toBeDefined();
    });

    test('should return 400 for missing data', async () => {
      const userData = {
        nombre: 'Test User',
        email: 'test@test.com'
        // Missing contraseña and rol
      };
      
      const response = await request(app)
        .post('/registro')
        .send(userData)
        .expect(400);
      
      expect(response.body.error).toBe('Nombre, email, contraseña y rol son requeridos');
    });
  });

  describe('POST /login', () => {
    test('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@test.com',
        contraseña: '123456'
      };
      
      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(200);
      
      expect(response.body.mensaje).toBe('Login exitoso');
      expect(response.body.token).toBeDefined();
      expect(response.body.usuario.email).toBe('test@test.com');
    });

    test('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'test@test.com',
        contraseña: 'wrongpassword'
      };
      
      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(401);
      
      expect(response.body.error).toBe('Credenciales inválidas');
    });

    test('should return 400 for missing credentials', async () => {
      const loginData = {
        email: 'test@test.com'
        // Missing contraseña
      };
      
      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(400);
      
      expect(response.body.error).toBe('Email y contraseña son requeridos');
    });
  });

  describe('GET /validar/:id', () => {
    test('should validate user existence', async () => {
      const response = await request(app)
        .get('/validar/1')
        .expect(200);
      
      expect(response.body.existe).toBe(true);
      expect(response.body.usuario).toBeDefined();
      expect(response.body.usuario.id).toBe('1');
    });
  });

  describe('GET /perfil/:id', () => {
    test('should return user profile with valid token', async () => {
      const payload = { id: '1', email: 'test@test.com' };
      const token = jwt.sign(payload, 'test-secret');
      
      const response = await request(app)
        .get('/perfil/1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(response.body.usuario).toBeDefined();
      expect(response.body.usuario.id).toBe('1');
    });

    test('should return 401 without token', async () => {
      const response = await request(app)
        .get('/perfil/1')
        .expect(401);
      
      expect(response.body.error).toBe('Token de acceso requerido');
    });

    test('should return 403 with invalid token', async () => {
      const response = await request(app)
        .get('/perfil/1')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
      
      expect(response.body.error).toBe('Token inválido');
    });
  });

  describe('JWT Token Generation', () => {
    test('should generate valid JWT token', () => {
      const payload = { id: '1', email: 'test@test.com' };
      const secret = 'test-secret';
      
      const token = jwt.sign(payload, secret, { expiresIn: '24h' });
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verificar que se puede decodificar
      const decoded = jwt.verify(token, secret);
      expect(decoded.id).toBe('1');
      expect(decoded.email).toBe('test@test.com');
    });
  });

  describe('Authentication Middleware', () => {
    test('should authenticate valid token', () => {
      const payload = { id: '1', email: 'test@test.com' };
      const token = jwt.sign(payload, 'test-secret');
      
      const decoded = jwt.verify(token, 'test-secret');
      
      expect(decoded.id).toBe('1');
      expect(decoded.email).toBe('test@test.com');
    });

    test('should reject invalid token', () => {
      expect(() => {
        jwt.verify('invalid-token', 'test-secret');
      }).toThrow();
    });
  });
});


