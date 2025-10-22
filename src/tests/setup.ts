// Global test setup
import { config } from 'dotenv';

// Load environment variables for testing
config({ path: '.env.test' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore console.log in tests
  // log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test timeout
jest.setTimeout(10000);

// Mock external dependencies
jest.mock('sequelize', () => {
  const mockSequelize = {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true),
    transaction: jest.fn().mockImplementation((callback) => callback({})),
  };
  
  return {
    Sequelize: jest.fn().mockImplementation(() => mockSequelize),
    DataTypes: {
      INTEGER: 'INTEGER',
      STRING: 'STRING',
      TEXT: 'TEXT',
      DECIMAL: 'DECIMAL',
      BOOLEAN: 'BOOLEAN',
      DATE: 'DATE',
      NOW: 'NOW',
    },
    Op: {
      and: Symbol('and'),
      or: Symbol('or'),
      not: Symbol('not'),
      eq: Symbol('eq'),
      ne: Symbol('ne'),
      gte: Symbol('gte'),
      gt: Symbol('gt'),
      lte: Symbol('lte'),
      lt: Symbol('lt'),
      between: Symbol('between'),
      notBetween: Symbol('notBetween'),
      in: Symbol('in'),
      notIn: Symbol('notIn'),
      like: Symbol('like'),
      notLike: Symbol('notLike'),
      iLike: Symbol('iLike'),
      notILike: Symbol('notILike'),
      startsWith: Symbol('startsWith'),
      endsWith: Symbol('endsWith'),
      substring: Symbol('substring'),
      regexp: Symbol('regexp'),
      notRegexp: Symbol('notRegexp'),
      iRegexp: Symbol('iRegexp'),
      notIRegexp: Symbol('notIRegexp'),
    },
  };
});

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('salt'),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ userId: 1 }),
  decode: jest.fn().mockReturnValue({ userId: 1 }),
}));

// Mock crypto
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue(Buffer.from('mock-random-bytes')),
  createCipher: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue(Buffer.from('mock-cipher')),
    final: jest.fn().mockReturnValue(Buffer.from('mock-final')),
  }),
  createDecipher: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue(Buffer.from('mock-decipher')),
    final: jest.fn().mockReturnValue(Buffer.from('mock-final')),
  }),
  createCipherGCM: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue(Buffer.from('mock-cipher-gcm')),
    final: jest.fn().mockReturnValue(Buffer.from('mock-final')),
    getAuthTag: jest.fn().mockReturnValue(Buffer.from('mock-auth-tag')),
  }),
  createDecipherGCM: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue(Buffer.from('mock-decipher-gcm')),
    final: jest.fn().mockReturnValue(Buffer.from('mock-final')),
    setAuthTag: jest.fn(),
  }),
  generateKeyPairSync: jest.fn().mockReturnValue({
    publicKey: 'mock-public-key',
    privateKey: 'mock-private-key',
  }),
  publicEncrypt: jest.fn().mockReturnValue(Buffer.from('mock-encrypted')),
  privateDecrypt: jest.fn().mockReturnValue(Buffer.from('mock-decrypted')),
}));

// Mock express
jest.mock('express', () => {
  const mockExpress = jest.fn(() => ({
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    listen: jest.fn(),
  }));
  
  mockExpress.json = jest.fn();
  mockExpress.urlencoded = jest.fn();
  mockExpress.static = jest.fn();
  
  return mockExpress;
});

// Mock helmet
jest.mock('helmet', () => jest.fn());

// Mock cors
jest.mock('cors', () => jest.fn());

// Mock swagger-ui-express
jest.mock('swagger-ui-express', () => ({
  serve: jest.fn(),
  setup: jest.fn(),
}));

// Mock swagger-jsdoc
jest.mock('swagger-jsdoc', () => jest.fn().mockReturnValue({}));

// Global test utilities
global.testUtils = {
  createMockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    user: undefined,
    ...overrides,
  }),
  
  createMockResponse: () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
  }),
  
  createMockNext: () => jest.fn(),
  
  createMockUser: (overrides = {}) => ({
    id: 1,
    nombre: 'Test User',
    email: 'test@sportsline.com',
    rol: 'admin',
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),
  
  createMockProducto: (overrides = {}) => ({
    id: 1,
    codigo: 'DEP-001',
    nombre: 'Test Product',
    descripcion: 'Test Description',
    precio: 99.99,
    stock: 50,
    categoria: 'Test Category',
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),
  
  createMockCliente: (overrides = {}) => ({
    id: 1,
    nombre: 'Test Client',
    email: 'client@test.com',
    telefono: '+573001234567',
    documento: '12345678',
    tipoDocumento: 'cedula',
    direccion: 'Test Address',
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),
  
  createMockPedido: (overrides = {}) => ({
    id: 1,
    clienteId: 1,
    usuarioId: 1,
    fecha: new Date(),
    total: 199.98,
    estado: 'pendiente',
    observaciones: 'Test Order',
    createdAt: new Date(),
    updatedAt: new Date(),
    detalles: [],
    ...overrides,
  }),
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Clean up after all tests
afterAll(() => {
  jest.restoreAllMocks();
});
