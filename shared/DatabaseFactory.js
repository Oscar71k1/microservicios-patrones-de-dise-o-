/**
 * Factory Method Pattern - DatabaseFactory
 * 
 * Crea conexiones de base de datos según el entorno
 * Soporta Firebase (producción) y Memoria (desarrollo/testing)
 */

const admin = require('firebase-admin');

class DatabaseFactory {
  /**
   * Crea una conexión de base de datos según el entorno
   * @param {string} serviceName - Nombre del servicio (usuarios, pagos, catalogo)
   * @param {Object} options - Opciones adicionales
   * @returns {Object} Conexión de base de datos
   */
  static createConnection(serviceName, options = {}) {
    console.log(`🏭 Factory Method: Creando conexión para ${serviceName}`);
    
    // Verificar si Firebase está configurado
    if (this.isFirebaseConfigured()) {
      console.log(`✅ Firebase configurado para ${serviceName}`);
      return new FirebaseConnection(serviceName, options);
    } else {
      console.log(`🧠 Usando conexión en memoria para ${serviceName}`);
      return new MemoryConnection(serviceName, options);
    }
  }

  /**
   * Verifica si Firebase está configurado
   * @returns {boolean}
   */
  static isFirebaseConfigured() {
    return !!(process.env.FIREBASE_PROJECT_ID || 
              (process.env.NODE_ENV === 'production' && 
               require('fs').existsSync('../../firebase-config.json')));
  }

  /**
   * Obtiene configuración de Firebase
   * @returns {Object} Configuración de Firebase
   */
  static getFirebaseConfig() {
    if (process.env.FIREBASE_PROJECT_ID) {
      return {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        universe_domain: "googleapis.com"
      };
    } else {
      return require('../../firebase-config.json');
    }
  }
}

/**
 * Conexión Firebase
 */
class FirebaseConnection {
  constructor(serviceName, options = {}) {
    this.serviceName = serviceName;
    this.options = options;
    this.db = null;
    this.initialize();
  }

  initialize() {
    try {
      if (!admin.apps.length) {
        const serviceAccount = DatabaseFactory.getFirebaseConfig();
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      }
      this.db = admin.firestore();
      console.log(`✅ Firebase inicializado para ${this.serviceName}`);
    } catch (error) {
      console.error(`❌ Error inicializando Firebase para ${this.serviceName}:`, error);
      throw error;
    }
  }

  /**
   * Obtener colección
   * @param {string} collection - Nombre de la colección
   * @returns {Object} Referencia a la colección
   */
  collection(collection) {
    return this.db.collection(collection);
  }

  /**
   * Obtener documento
   * @param {string} collection - Nombre de la colección
   * @param {string} docId - ID del documento
   * @returns {Object} Referencia al documento
   */
  doc(collection, docId) {
    return this.db.collection(collection).doc(docId);
  }

  /**
   * Verificar si la conexión está activa
   * @returns {boolean}
   */
  isConnected() {
    return this.db !== null;
  }

  /**
   * Obtener información de la conexión
   * @returns {Object}
   */
  getInfo() {
    return {
      type: 'Firebase',
      service: this.serviceName,
      connected: this.isConnected()
    };
  }
}

/**
 * Conexión en Memoria
 */
class MemoryConnection {
  constructor(serviceName, options = {}) {
    this.serviceName = serviceName;
    this.options = options;
    this.data = new Map();
    this.collections = new Map();
    this.initialize();
  }

  initialize() {
    console.log(`🧠 Inicializando conexión en memoria para ${this.serviceName}`);
    this.setupDefaultData();
  }

  /**
   * Configurar datos por defecto según el servicio
   */
  setupDefaultData() {
    switch (this.serviceName) {
      case 'usuarios':
        this.collections.set('usuarios', [
          {
            id: '1',
            nombre: 'Admin Sistema',
            email: 'admin@universidad.com',
            contraseña: '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV',
            rol: 'Admin',
            tenantId: 'universidad_principal',
            campus: 'Campus Principal',
            carrera: 'Administración'
          }
        ]);
        break;
      
      case 'pagos':
        this.collections.set('pagos', [
          {
            id: '1',
            usuarioId: '1',
            concepto: 'Matrícula Semestre 2024-1',
            monto: 1500000,
            estado: 'Pendiente',
            fechaCreacion: '2024-01-15T10:30:00.000Z'
          }
        ]);
        break;
      
      case 'catalogo':
        this.collections.set('conceptos', [
          {
            id: '1',
            codigo: 'MAT-001',
            nombre: 'Matrícula Semestral',
            descripcion: 'Matrícula para el semestre académico',
            monto: 1500000,
            tipo: 'Obligatorio',
            tenantId: 'universidad_principal',
            activo: true
          }
        ]);
        break;
    }
  }

  /**
   * Obtener colección
   * @param {string} collection - Nombre de la colección
   * @returns {Object} Referencia a la colección
   */
  collection(collection) {
    if (!this.collections.has(collection)) {
      this.collections.set(collection, []);
    }
    return new MemoryCollection(collection, this.collections.get(collection));
  }

  /**
   * Obtener documento
   * @param {string} collection - Nombre de la colección
   * @param {string} docId - ID del documento
   * @returns {Object} Referencia al documento
   */
  doc(collection, docId) {
    const coll = this.collection(collection);
    return coll.doc(docId);
  }

  /**
   * Verificar si la conexión está activa
   * @returns {boolean}
   */
  isConnected() {
    return true;
  }

  /**
   * Obtener información de la conexión
   * @returns {Object}
   */
  getInfo() {
    return {
      type: 'Memory',
      service: this.serviceName,
      connected: this.isConnected(),
      collections: Array.from(this.collections.keys())
    };
  }
}

/**
 * Colección en Memoria (simula Firestore)
 */
class MemoryCollection {
  constructor(name, data) {
    this.name = name;
    this.data = data;
  }

  /**
   * Agregar documento
   * @param {Object} docData - Datos del documento
   * @returns {Object} Referencia al documento creado
   */
  async add(docData) {
    const id = (this.data.length + 1).toString();
    const doc = { id, ...docData };
    this.data.push(doc);
    return { id };
  }

  /**
   * Obtener documento por ID
   * @param {string} id - ID del documento
   * @returns {Object} Documento
   */
  async get(id) {
    const doc = this.data.find(d => d.id === id);
    return {
      exists: !!doc,
      id: id,
      data: () => doc
    };
  }

  /**
   * Obtener referencia a documento
   * @param {string} id - ID del documento
   * @returns {Object} Referencia al documento
   */
  doc(id) {
    return {
      get: async () => {
        const doc = this.data.find(d => d.id === id);
        return {
          exists: !!doc,
          id: id,
          data: () => doc
        };
      }
    };
  }

  /**
   * Filtrar documentos
   * @param {string} field - Campo a filtrar
   * @param {string} operator - Operador
   * @param {*} value - Valor
   * @returns {Object} Query
   */
  where(field, operator, value) {
    return new MemoryQuery(this.data, field, operator, value);
  }

  /**
   * Obtener todos los documentos
   * @returns {Array} Documentos
   */
  async get() {
    return {
      docs: this.data.map(doc => ({
        id: doc.id,
        data: () => doc
      }))
    };
  }
}

/**
 * Query en Memoria
 */
class MemoryQuery {
  constructor(data, field, operator, value) {
    this.data = data;
    this.field = field;
    this.operator = operator;
    this.value = value;
    this.filters = [{ field, operator, value }];
  }

  /**
   * Agregar filtro adicional
   * @param {string} field - Campo
   * @param {string} operator - Operador
   * @param {*} value - Valor
   * @returns {MemoryQuery}
   */
  where(field, operator, value) {
    this.filters.push({ field, operator, value });
    return this;
  }

  /**
   * Ordenar resultados
   * @param {string} field - Campo
   * @param {string} direction - Dirección (asc/desc)
   * @returns {MemoryQuery}
   */
  orderBy(field, direction = 'asc') {
    this.orderField = field;
    this.orderDirection = direction;
    return this;
  }

  /**
   * Ejecutar query
   * @returns {Object} Resultados
   */
  async get() {
    let results = [...this.data];

    // Aplicar filtros
    this.filters.forEach(filter => {
      results = results.filter(doc => {
        const docValue = doc[filter.field];
        switch (filter.operator) {
          case '==':
            return docValue === filter.value;
          case '!=':
            return docValue !== filter.value;
          case '>':
            return docValue > filter.value;
          case '<':
            return docValue < filter.value;
          case '>=':
            return docValue >= filter.value;
          case '<=':
            return docValue <= filter.value;
          default:
            return true;
        }
      });
    });

    // Aplicar ordenamiento
    if (this.orderField) {
      results.sort((a, b) => {
        const aVal = a[this.orderField];
        const bVal = b[this.orderField];
        if (this.orderDirection === 'desc') {
          return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });
    }

    return {
      docs: results.map(doc => ({
        id: doc.id,
        data: () => doc
      })),
      empty: results.length === 0
    };
  }
}

module.exports = {
  DatabaseFactory,
  FirebaseConnection,
  MemoryConnection
};

