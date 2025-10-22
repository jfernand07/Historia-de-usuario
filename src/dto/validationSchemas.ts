import Joi from 'joi';

// Base validation schemas
export const commonSchemas = {
  id: Joi.number().integer().positive().required(),
  email: Joi.string().email().max(100).required(),
  password: Joi.string().min(6).max(128).required(),
  nombre: Joi.string().min(2).max(100).required(),
  activo: Joi.boolean(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
};

// Authentication validation schemas
export const authSchemas = {
  login: Joi.object({
    email: commonSchemas.email,
    password: commonSchemas.password
  }),

  register: Joi.object({
    nombre: commonSchemas.nombre,
    email: commonSchemas.email,
    password: commonSchemas.password,
    rol: Joi.string().valid('admin', 'vendedor').default('vendedor')
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required()
  }),

  changePassword: Joi.object({
    currentPassword: commonSchemas.password,
    newPassword: commonSchemas.password
  }),

  updateProfile: Joi.object({
    nombre: commonSchemas.nombre.optional(),
    email: commonSchemas.email.optional()
  }).min(1), // At least one field must be provided

  usuarioFilters: Joi.object({
    rol: Joi.string().valid('admin', 'vendedor').optional(),
    activo: Joi.boolean().optional(),
    search: Joi.string().max(100).optional(),
    page: commonSchemas.page,
    limit: commonSchemas.limit
  }),

  usuarioParams: Joi.object({
    id: commonSchemas.id
  })
};

// Product validation schemas
export const productSchemas = {
  create: Joi.object({
    codigo: Joi.string().max(50).required(),
    nombre: Joi.string().min(2).max(100).required(),
    descripcion: Joi.string().max(500).optional(),
    precio: Joi.number().positive().precision(2).required(),
    stock: Joi.number().integer().min(0).required(),
    categoria: Joi.string().max(50).required(),
    activo: Joi.boolean().default(true)
  }),

  update: Joi.object({
    codigo: Joi.string().max(50).optional(),
    nombre: Joi.string().min(2).max(100).optional(),
    descripcion: Joi.string().max(500).optional(),
    precio: Joi.number().positive().precision(2).optional(),
    stock: Joi.number().integer().min(0).optional(),
    categoria: Joi.string().max(50).optional(),
    activo: Joi.boolean().optional()
  }).min(1),

  filters: Joi.object({
    categoria: Joi.string().max(50).optional(),
    activo: Joi.boolean().optional(),
    search: Joi.string().max(100).optional(),
    minPrecio: Joi.number().positive().optional(),
    maxPrecio: Joi.number().positive().optional(),
    page: commonSchemas.page,
    limit: commonSchemas.limit
  }),

  params: Joi.object({
    id: commonSchemas.id
  }),

  stockUpdate: Joi.object({
    cantidad: Joi.number().integer().min(0).required(),
    operacion: Joi.string().valid('add', 'subtract', 'set').required()
  })
};

// Client validation schemas
export const clientSchemas = {
  create: Joi.object({
    nombre: commonSchemas.nombre,
    email: commonSchemas.email,
    telefono: Joi.string().max(20).optional(),
    direccion: Joi.string().max(200).optional(),
    documento: Joi.string().max(50).required(),
    tipoDocumento: Joi.string().valid('cedula', 'pasaporte', 'nit').default('cedula'),
    activo: Joi.boolean().default(true)
  }),

  update: Joi.object({
    nombre: commonSchemas.nombre.optional(),
    email: commonSchemas.email.optional(),
    telefono: Joi.string().max(20).optional(),
    direccion: Joi.string().max(200).optional(),
    documento: Joi.string().max(50).optional(),
    tipoDocumento: Joi.string().valid('cedula', 'pasaporte', 'nit').optional(),
    activo: Joi.boolean().optional()
  }).min(1),

  filters: Joi.object({
    tipoDocumento: Joi.string().valid('cedula', 'pasaporte', 'nit').optional(),
    activo: Joi.boolean().optional(),
    search: Joi.string().max(100).optional(),
    page: commonSchemas.page,
    limit: commonSchemas.limit
  }),

  params: Joi.object({
    id: commonSchemas.id
  })
};

// Order validation schemas (for future use)
export const orderSchemas = {
  create: Joi.object({
    clienteId: commonSchemas.id,
    productos: Joi.array().items(
      Joi.object({
        productoId: commonSchemas.id,
        cantidad: Joi.number().integer().min(1).required(),
        precioUnitario: Joi.number().positive().precision(2).required()
      })
    ).min(1).required()
  }),

  update: Joi.object({
    estado: Joi.string().valid('pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado').optional()
  }).min(1),

  filters: Joi.object({
    clienteId: commonSchemas.id.optional(),
    productoId: commonSchemas.id.optional(),
    estado: Joi.string().valid('pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado').optional(),
    fechaInicio: Joi.date().optional(),
    fechaFin: Joi.date().optional(),
    page: commonSchemas.page,
    limit: commonSchemas.limit
  }),

  params: Joi.object({
    id: commonSchemas.id
  })
};

// Encryption validation schemas
export const encryptionSchemas = {
  generateKeyPair: Joi.object({}),
  
  encryptData: Joi.object({
    data: Joi.any().required(),
    publicKey: Joi.string().required()
  }),
  
  decryptData: Joi.object({
    encryptedData: Joi.string().required(),
    encryptedKey: Joi.string().required(),
    iv: Joi.string().required(),
    privateKey: Joi.string().required()
  }),
  
  encryptUserInfo: Joi.object({
    userData: Joi.object().required(),
    publicKey: Joi.string().required()
  }),
  
  decryptUserInfo: Joi.object({
    encryptedData: Joi.string().required(),
    encryptedKey: Joi.string().required(),
    iv: Joi.string().required(),
    privateKey: Joi.string().required()
  }),
  
  hashData: Joi.object({
    data: Joi.string().required()
  }),
  
  generateRandom: Joi.object({
    length: Joi.number().integer().min(8).max(256).optional()
  })
};

// Centralized validation middleware factory
export class ValidationSchemaFactory {
  /**
   * Create validation middleware for request body
   */
  static createBodyValidation(schema: Joi.ObjectSchema) {
    return (req: any, res: any, next: any) => {
      const { error } = schema.validate(req.body);
      
      if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        return res.status(400).json({
          success: false,
          message: errorMessage,
          errors: error.details
        });
      }
      
      next();
    };
  }

  /**
   * Create validation middleware for query parameters
   */
  static createQueryValidation(schema: Joi.ObjectSchema) {
    return (req: any, res: any, next: any) => {
      const { error } = schema.validate(req.query);
      
      if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        return res.status(400).json({
          success: false,
          message: errorMessage,
          errors: error.details
        });
      }
      
      next();
    };
  }

  /**
   * Create validation middleware for route parameters
   */
  static createParamsValidation(schema: Joi.ObjectSchema) {
    return (req: any, res: any, next: any) => {
      const { error } = schema.validate(req.params);
      
      if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        return res.status(400).json({
          success: false,
          message: errorMessage,
          errors: error.details
        });
      }
      
      next();
    };
  }

  /**
   * Create validation middleware for headers
   */
  static createHeadersValidation(schema: Joi.ObjectSchema) {
    return (req: any, res: any, next: any) => {
      const { error } = schema.validate(req.headers);
      
      if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        return res.status(400).json({
          success: false,
          message: errorMessage,
          errors: error.details
        });
      }
      
      next();
    };
  }
}

// Custom validation functions
export const customValidations = {
  /**
   * Validate Colombian phone number
   */
  colombianPhone: (value: string) => {
    const phoneRegex = /^(\+57|57)?[1-9]\d{9}$/;
    return phoneRegex.test(value.replace(/\s/g, ''));
  },

  /**
   * Validate Colombian document (cedula)
   */
  colombianCedula: (value: string) => {
    const cedulaRegex = /^[1-9]\d{6,10}$/;
    return cedulaRegex.test(value);
  },

  /**
   * Validate Colombian NIT
   */
  colombianNit: (value: string) => {
    const nitRegex = /^[0-9]{9}-[0-9]$/;
    return nitRegex.test(value);
  },

  /**
   * Validate product code format
   */
  productCode: (value: string) => {
    const codeRegex = /^[A-Z]{2,4}-[0-9]{3,6}$/;
    return codeRegex.test(value);
  },

  /**
   * Validate price format
   */
  price: (value: number) => {
    return value > 0 && value <= 999999.99 && Number.isFinite(value);
  },

  /**
   * Validate stock quantity
   */
  stock: (value: number) => {
    return Number.isInteger(value) && value >= 0 && value <= 999999;
  }
};

// Add custom validations to Joi
Joi.extend({
  type: 'string',
  base: Joi.string(),
  messages: {
    'string.colombianPhone': 'must be a valid Colombian phone number',
    'string.colombianCedula': 'must be a valid Colombian cedula',
    'string.colombianNit': 'must be a valid Colombian NIT',
    'string.productCode': 'must be a valid product code format (e.g., PROD-001)'
  },
  rules: {
    colombianPhone: {
      validate: (value: string, helpers: any) => {
        if (!customValidations.colombianPhone(value)) {
          return helpers.error('string.colombianPhone');
        }
        return value;
      }
    },
    colombianCedula: {
      validate: (value: string, helpers: any) => {
        if (!customValidations.colombianCedula(value)) {
          return helpers.error('string.colombianCedula');
        }
        return value;
      }
    },
    colombianNit: {
      validate: (value: string, helpers: any) => {
        if (!customValidations.colombianNit(value)) {
          return helpers.error('string.colombianNit');
        }
        return value;
      }
    },
    productCode: {
      validate: (value: string, helpers: any) => {
        if (!customValidations.productCode(value)) {
          return helpers.error('string.productCode');
        }
        return value;
      }
    }
  }
});

Joi.extend({
  type: 'number',
  base: Joi.number(),
  messages: {
    'number.price': 'must be a valid price (0 < price <= 999999.99)',
    'number.stock': 'must be a valid stock quantity (0 <= stock <= 999999)'
  },
  rules: {
    price: {
      validate: (value: number, helpers: any) => {
        if (!customValidations.price(value)) {
          return helpers.error('number.price');
        }
        return value;
      }
    },
    stock: {
      validate: (value: number, helpers: any) => {
        if (!customValidations.stock(value)) {
          return helpers.error('number.stock');
        }
        return value;
      }
    }
  }
});