import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerConfig = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SportsLine API',
      version: '1.0.0',
      description: `
        # SportsLine API Documentation
        
        Esta API proporciona funcionalidades completas para la gestión de una tienda deportiva, incluyendo:
        
        ## Características Principales
        
        - **Autenticación y Autorización**: Sistema JWT con refresh tokens y roles (admin/vendedor)
        - **Gestión de Usuarios**: CRUD completo con validaciones y cifrado híbrido
        - **Gestión de Productos**: CRUD con validación de códigos únicos y control de stock
        - **Gestión de Clientes**: CRUD con validaciones de documentos colombianos
        - **Gestión de Pedidos**: Sistema completo con validación de stock y cifrado híbrido
        - **Cifrado Híbrido**: AES-256-GCM + RSA para operaciones sensibles
        - **Validaciones**: Middlewares centralizados con Joi
        - **Documentación**: Swagger completo con ejemplos
        
        ## Seguridad
        
        - Autenticación JWT obligatoria para todas las rutas protegidas
        - Roles de usuario (admin/vendedor) con permisos específicos
        - Cifrado híbrido para datos sensibles
        - Validación de entrada con sanitización
        - Logging de operaciones de seguridad
        
        ## Estructura de Respuestas
        
        Todas las respuestas siguen el formato estándar:
        \`\`\`json
        {
          "success": true,
          "data": { ... },
          "message": "Operation completed successfully"
        }
        \`\`\`
        
        ## Códigos de Estado
        
        - **200**: Operación exitosa
        - **201**: Recurso creado exitosamente
        - **400**: Error de validación
        - **401**: No autorizado
        - **403**: Prohibido (sin permisos)
        - **404**: Recurso no encontrado
        - **500**: Error interno del servidor
      `,
      contact: {
        name: 'SportsLine Development Team',
        email: 'dev@sportsline.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.sportsline.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtenido del endpoint de login'
        }
      },
      schemas: {
        // Common schemas
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'email'
                  },
                  message: {
                    type: 'string',
                    example: 'Email is required'
                  }
                }
              }
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            }
          }
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                  items: {
                    type: 'object'
                  }
                },
                pagination: {
                  type: 'object',
                  properties: {
                    page: {
                      type: 'number',
                      example: 1
                    },
                    limit: {
                      type: 'number',
                      example: 10
                    },
                    total: {
                      type: 'number',
                      example: 100
                    },
                    totalPages: {
                      type: 'number',
                      example: 10
                    }
                  }
                }
              }
            },
            message: {
              type: 'string',
              example: 'Data retrieved successfully'
            }
          }
        },
        
        // Authentication schemas
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@sportsline.com',
              description: 'Email del usuario'
            },
            password: {
              type: 'string',
              minLength: 6,
              example: 'password123',
              description: 'Contraseña del usuario'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'number',
                      example: 1
                    },
                    nombre: {
                      type: 'string',
                      example: 'Admin User'
                    },
                    email: {
                      type: 'string',
                      example: 'admin@sportsline.com'
                    },
                    rol: {
                      type: 'string',
                      enum: ['admin', 'vendedor'],
                      example: 'admin'
                    }
                  }
                },
                accessToken: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                },
                refreshToken: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                },
                expiresIn: {
                  type: 'number',
                  example: 3600
                }
              }
            },
            message: {
              type: 'string',
              example: 'Login successful'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['nombre', 'email', 'password', 'rol'],
          properties: {
            nombre: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              example: 'Juan Pérez',
              description: 'Nombre completo del usuario'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'juan@sportsline.com',
              description: 'Email único del usuario'
            },
            password: {
              type: 'string',
              minLength: 6,
              maxLength: 128,
              example: 'password123',
              description: 'Contraseña del usuario'
            },
            rol: {
              type: 'string',
              enum: ['admin', 'vendedor'],
              example: 'vendedor',
              description: 'Rol del usuario'
            }
          }
        },
        
        // Product schemas
        Producto: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              example: 1
            },
            codigo: {
              type: 'string',
              example: 'DEP-001',
              description: 'Código único del producto'
            },
            nombre: {
              type: 'string',
              example: 'Balón de Fútbol',
              description: 'Nombre del producto'
            },
            descripcion: {
              type: 'string',
              example: 'Balón oficial de fútbol profesional',
              description: 'Descripción del producto'
            },
            precio: {
              type: 'number',
              format: 'decimal',
              example: 89.99,
              description: 'Precio del producto'
            },
            stock: {
              type: 'number',
              example: 50,
              description: 'Cantidad en stock'
            },
            categoria: {
              type: 'string',
              example: 'Fútbol',
              description: 'Categoría del producto'
            },
            activo: {
              type: 'boolean',
              example: true,
              description: 'Estado del producto'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            }
          }
        },
        ProductoCreateRequest: {
          type: 'object',
          required: ['codigo', 'nombre', 'precio', 'stock', 'categoria'],
          properties: {
            codigo: {
              type: 'string',
              pattern: '^[A-Z]{2,4}-[0-9]{3,6}$',
              example: 'DEP-001',
              description: 'Código único (formato: ABC-123)'
            },
            nombre: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              example: 'Balón de Fútbol',
              description: 'Nombre del producto'
            },
            descripcion: {
              type: 'string',
              maxLength: 500,
              example: 'Balón oficial de fútbol profesional',
              description: 'Descripción del producto'
            },
            precio: {
              type: 'number',
              minimum: 0.01,
              maximum: 999999.99,
              example: 89.99,
              description: 'Precio del producto'
            },
            stock: {
              type: 'number',
              minimum: 0,
              maximum: 999999,
              example: 50,
              description: 'Cantidad en stock'
            },
            categoria: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              example: 'Fútbol',
              description: 'Categoría del producto'
            }
          }
        },
        
        // Client schemas
        Cliente: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              example: 1
            },
            nombre: {
              type: 'string',
              example: 'María García'
            },
            email: {
              type: 'string',
              example: 'maria@email.com'
            },
            telefono: {
              type: 'string',
              example: '+573001234567'
            },
            documento: {
              type: 'string',
              example: '12345678'
            },
            tipoDocumento: {
              type: 'string',
              enum: ['cedula', 'pasaporte', 'nit'],
              example: 'cedula'
            },
            direccion: {
              type: 'string',
              example: 'Calle 123 #45-67'
            },
            activo: {
              type: 'boolean',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        ClienteCreateRequest: {
          type: 'object',
          required: ['nombre', 'email', 'telefono', 'documento', 'tipoDocumento'],
          properties: {
            nombre: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              example: 'María García'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'maria@email.com'
            },
            telefono: {
              type: 'string',
              pattern: '^(\+57|57)?[1-9]\\d{9}$',
              example: '+573001234567',
              description: 'Teléfono colombiano'
            },
            documento: {
              type: 'string',
              example: '12345678',
              description: 'Número de documento'
            },
            tipoDocumento: {
              type: 'string',
              enum: ['cedula', 'pasaporte', 'nit'],
              example: 'cedula'
            },
            direccion: {
              type: 'string',
              maxLength: 200,
              example: 'Calle 123 #45-67'
            }
          }
        },
        
        // Order schemas
        Pedido: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              example: 1
            },
            clienteId: {
              type: 'number',
              example: 1
            },
            usuarioId: {
              type: 'number',
              example: 1
            },
            fecha: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            },
            total: {
              type: 'number',
              format: 'decimal',
              example: 299.97
            },
            estado: {
              type: 'string',
              enum: ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'],
              example: 'pendiente'
            },
            observaciones: {
              type: 'string',
              example: 'Pedido urgente'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            },
            detalles: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/DetallePedido'
              }
            }
          }
        },
        DetallePedido: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              example: 1
            },
            pedidoId: {
              type: 'number',
              example: 1
            },
            productoId: {
              type: 'number',
              example: 1
            },
            cantidad: {
              type: 'number',
              example: 2
            },
            precioUnitario: {
              type: 'number',
              format: 'decimal',
              example: 89.99
            },
            subtotal: {
              type: 'number',
              format: 'decimal',
              example: 179.98
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        PedidoCreateRequest: {
          type: 'object',
          required: ['clienteId', 'productos'],
          properties: {
            clienteId: {
              type: 'number',
              example: 1,
              description: 'ID del cliente'
            },
            productos: {
              type: 'array',
              items: {
                type: 'object',
                required: ['productoId', 'cantidad'],
                properties: {
                  productoId: {
                    type: 'number',
                    example: 1,
                    description: 'ID del producto'
                  },
                  cantidad: {
                    type: 'number',
                    minimum: 1,
                    example: 2,
                    description: 'Cantidad del producto'
                  }
                }
              },
              description: 'Lista de productos en el pedido'
            },
            observaciones: {
              type: 'string',
              maxLength: 500,
              example: 'Pedido urgente',
              description: 'Observaciones del pedido'
            }
          }
        },
        
        // Encryption schemas
        EncryptedData: {
          type: 'object',
          properties: {
            encrypted: {
              type: 'boolean',
              example: true
            },
            encryptedData: {
              type: 'string',
              example: 'encrypted_data_string',
              description: 'Datos cifrados con AES-256-GCM'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z'
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'No autorizado - Token JWT inválido o expirado',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Token JWT inválido o expirado',
                errors: []
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Prohibido - Sin permisos para acceder al recurso',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'No tienes permisos para acceder a este recurso',
                errors: []
              }
            }
          }
        },
        ValidationError: {
          description: 'Error de validación - Datos de entrada inválidos',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Validation error',
                errors: [
                  {
                    field: 'email',
                    message: 'Email is required'
                  }
                ]
              }
            }
          }
        },
        NotFoundError: {
          description: 'No encontrado - Recurso no existe',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Resource not found',
                errors: []
              }
            }
          }
        },
        InternalServerError: {
          description: 'Error interno del servidor',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              },
              example: {
                success: false,
                message: 'Internal server error',
                errors: []
              }
            }
          }
        }
      }
    },
    apis: [
      './src/routes/*.ts',
      './src/controllers/*.ts'
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ]
};

export const swaggerSpec = swaggerJsdoc(swaggerConfig);
