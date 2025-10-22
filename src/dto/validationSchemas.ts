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
