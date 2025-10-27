const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Microservicio de Catálogo API',
    version: '1.0.0',
    description: 'API para gestión del catálogo académico-financiero con patrones de diseño',
    contact: {
      name: 'Sistema de Microservicios',
      email: 'admin@universidad.edu'
    }
  },
  servers: [
    {
      url: 'http://localhost:3004',
      description: 'Servidor de desarrollo'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Concepto: {
        type: 'object',
        required: ['nombre', 'descripcion', 'monto'],
        properties: {
          id: {
            type: 'string',
            description: 'ID único del concepto'
          },
          nombre: {
            type: 'string',
            description: 'Nombre del concepto'
          },
          descripcion: {
            type: 'string',
            description: 'Descripción del concepto'
          },
          monto: {
            type: 'number',
            description: 'Monto del concepto'
          },
          tipo: {
            type: 'string',
            enum: ['academico', 'financiero'],
            description: 'Tipo de concepto'
          },
          activo: {
            type: 'boolean',
            description: 'Si el concepto está activo'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Mensaje de error'
          },
          details: {
            type: 'string',
            description: 'Detalles adicionales del error'
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

module.exports = swaggerDefinition;
