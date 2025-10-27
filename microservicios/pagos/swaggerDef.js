const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Microservicio de Pagos API',
    version: '1.0.0',
    description: 'API para gestión de pagos y órdenes con patrones de diseño',
    contact: {
      name: 'Sistema de Microservicios',
      email: 'admin@universidad.edu'
    }
  },
  servers: [
    {
      url: 'http://localhost:3002',
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
      Pago: {
        type: 'object',
        required: ['usuarioId', 'conceptoId', 'monto'],
        properties: {
          id: {
            type: 'string',
            description: 'ID único del pago'
          },
          usuarioId: {
            type: 'string',
            description: 'ID del usuario'
          },
          conceptoId: {
            type: 'string',
            description: 'ID del concepto a pagar'
          },
          monto: {
            type: 'number',
            description: 'Monto del pago'
          },
          estado: {
            type: 'string',
            enum: ['pendiente', 'procesado', 'cancelado'],
            description: 'Estado del pago'
          },
          fechaCreacion: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de creación del pago'
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
