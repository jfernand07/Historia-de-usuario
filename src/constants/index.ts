/**
 * Application constants
 * Implements Clean Code principles by eliminating magic numbers and strings
 */

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  VENDEDOR: 'vendedor'
} as const;

// User Status
export const USER_STATUS = {
  ACTIVE: true,
  INACTIVE: false
} as const;

// Product Status
export const PRODUCT_STATUS = {
  ACTIVE: true,
  INACTIVE: false
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDIENTE: 'pendiente',
  CONFIRMADO: 'confirmado',
  ENVIADO: 'enviado',
  ENTREGADO: 'entregado',
  CANCELADO: 'cancelado'
} as const;

// Order Status Transitions
export const ORDER_STATUS_TRANSITIONS = {
  [ORDER_STATUS.PENDIENTE]: [ORDER_STATUS.CONFIRMADO, ORDER_STATUS.CANCELADO],
  [ORDER_STATUS.CONFIRMADO]: [ORDER_STATUS.ENVIADO, ORDER_STATUS.CANCELADO],
  [ORDER_STATUS.ENVIADO]: [ORDER_STATUS.ENTREGADO],
  [ORDER_STATUS.ENTREGADO]: [],
  [ORDER_STATUS.CANCELADO]: []
} as const;

// Document Types
export const DOCUMENT_TYPES = {
  CEDULA: 'cedula',
  PASAPORTE: 'pasaporte',
  NIT: 'nit'
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1
} as const;

// JWT Configuration
export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRES_IN: '1h',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
  ALGORITHM: 'HS256'
} as const;

// Encryption
export const ENCRYPTION = {
  AES_KEY_LENGTH: 32,
  RSA_KEY_SIZE: 2048,
  ALGORITHM: 'aes-256-gcm'
} as const;

// Validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 500,
  ADDRESS_MAX_LENGTH: 200,
  OBSERVATIONS_MAX_LENGTH: 500,
  PRODUCT_CODE_PATTERN: /^[A-Z]{2,4}-[0-9]{3,6}$/,
  PHONE_PATTERN: /^(\+57|57)?[1-9]\d{9}$/,
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  CEDULA_PATTERN: /^\d{7,11}$/,
  PASAPORTE_PATTERN: /^[A-Z0-9]{6,12}$/i,
  NIT_PATTERN: /^\d{9}-\d$/
} as const;

// Database
export const DATABASE = {
  DEFAULT_TIMEOUT: 30000,
  MAX_CONNECTIONS: 10,
  MIN_CONNECTIONS: 2,
  CONNECTION_RETRY_ATTEMPTS: 3
} as const;

// API
export const API = {
  VERSION: '1.0.0',
  BASE_PATH: '/api',
  DOCS_PATH: '/api-docs',
  HEALTH_PATH: '/health'
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid credentials',
  TOKEN_EXPIRED: 'Token expired',
  TOKEN_INVALID: 'Invalid token',
  USER_NOT_FOUND: 'User not found',
  USER_INACTIVE: 'User account is inactive',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  
  // Validation
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PHONE: 'Invalid phone number',
  INVALID_DOCUMENT: 'Invalid document number',
  INVALID_DATE: 'Invalid date format',
  INVALID_NUMBER: 'Invalid number format',
  
  // Products
  PRODUCT_NOT_FOUND: 'Product not found',
  PRODUCT_CODE_EXISTS: 'Product code already exists',
  INSUFFICIENT_STOCK: 'Insufficient stock',
  
  // Clients
  CLIENT_NOT_FOUND: 'Client not found',
  CLIENT_EMAIL_EXISTS: 'Client email already exists',
  CLIENT_DOCUMENT_EXISTS: 'Client document already exists',
  
  // Orders
  ORDER_NOT_FOUND: 'Order not found',
  ORDER_CANNOT_BE_CANCELLED: 'Order cannot be cancelled',
  ORDER_CANNOT_BE_MODIFIED: 'Order cannot be modified',
  INVALID_STATUS_TRANSITION: 'Invalid status transition',
  
  // General
  INTERNAL_ERROR: 'Internal server error',
  VALIDATION_ERROR: 'Validation error',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden access',
  BAD_REQUEST: 'Bad request',
  CONFLICT: 'Resource conflict'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'User registered successfully',
  LOGOUT_SUCCESS: 'Logout successful',
  TOKEN_REFRESHED: 'Token refreshed successfully',
  
  // CRUD Operations
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  RETRIEVED: 'Resource retrieved successfully',
  LIST_RETRIEVED: 'Resources retrieved successfully',
  
  // Specific Resources
  PRODUCT_CREATED: 'Product created successfully',
  PRODUCT_UPDATED: 'Product updated successfully',
  PRODUCT_DELETED: 'Product deleted successfully',
  STOCK_UPDATED: 'Stock updated successfully',
  
  CLIENT_CREATED: 'Client created successfully',
  CLIENT_UPDATED: 'Client updated successfully',
  CLIENT_DELETED: 'Client deleted successfully',
  
  ORDER_CREATED: 'Order created successfully',
  ORDER_UPDATED: 'Order updated successfully',
  ORDER_CANCELLED: 'Order cancelled successfully',
  ORDER_CONFIRMED: 'Order confirmed successfully',
  
  // Encryption
  DATA_ENCRYPTED: 'Data encrypted successfully',
  DATA_DECRYPTED: 'Data decrypted successfully',
  INTEGRITY_VERIFIED: 'Data integrity verified'
} as const;

// Log Levels
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
} as const;

// Cache Keys
export const CACHE_KEYS = {
  USER: 'user',
  PRODUCT: 'product',
  CLIENT: 'client',
  ORDER: 'order',
  STATISTICS: 'statistics'
} as const;

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  USER: 3600, // 1 hour
  PRODUCT: 1800, // 30 minutes
  CLIENT: 1800, // 30 minutes
  ORDER: 900, // 15 minutes
  STATISTICS: 300 // 5 minutes
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  UPLOAD_PATH: 'uploads/'
} as const;

// Rate Limiting
export const RATE_LIMITING = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  SKIP_SUCCESSFUL_REQUESTS: false,
  SKIP_FAILED_REQUESTS: false
} as const;

// Security
export const SECURITY = {
  BCRYPT_ROUNDS: 12,
  SESSION_SECRET_LENGTH: 32,
  CSRF_TOKEN_LENGTH: 32,
  PASSWORD_RESET_TOKEN_LENGTH: 32
} as const;

// Environment
export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  TESTING: 'test',
  PRODUCTION: 'production'
} as const;

// Database Tables
export const TABLES = {
  USUARIOS: 'usuarios',
  PRODUCTOS: 'productos',
  CLIENTES: 'clientes',
  PEDIDOS: 'pedidos',
  DETALLE_PEDIDOS: 'detalle_pedidos'
} as const;

// Database Columns
export const COLUMNS = {
  ID: 'id',
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  ACTIVO: 'activo',
  NOMBRE: 'nombre',
  EMAIL: 'email',
  PASSWORD: 'password',
  ROL: 'rol',
  CODIGO: 'codigo',
  DESCRIPCION: 'descripcion',
  PRECIO: 'precio',
  STOCK: 'stock',
  CATEGORIA: 'categoria',
  TELEFONO: 'telefono',
  DOCUMENTO: 'documento',
  TIPO_DOCUMENTO: 'tipoDocumento',
  DIRECCION: 'direccion',
  CLIENTE_ID: 'clienteId',
  USUARIO_ID: 'usuarioId',
  FECHA: 'fecha',
  TOTAL: 'total',
  ESTADO: 'estado',
  OBSERVACIONES: 'observaciones',
  PRODUCTO_ID: 'productoId',
  PEDIDO_ID: 'pedidoId',
  CANTIDAD: 'cantidad',
  PRECIO_UNITARIO: 'precioUnitario',
  SUBTOTAL: 'subtotal'
} as const;

// Sort Orders
export const SORT_ORDERS = {
  ASC: 'ASC',
  DESC: 'DESC'
} as const;

// Default Sort Fields
export const DEFAULT_SORT_FIELDS = {
  USUARIOS: 'createdAt',
  PRODUCTOS: 'createdAt',
  CLIENTES: 'createdAt',
  PEDIDOS: 'fecha'
} as const;

// Default Sort Orders
export const DEFAULT_SORT_ORDERS = {
  USUARIOS: SORT_ORDERS.DESC,
  PRODUCTOS: SORT_ORDERS.DESC,
  CLIENTES: SORT_ORDERS.DESC,
  PEDIDOS: SORT_ORDERS.DESC
} as const;
