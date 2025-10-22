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
  
  // Mock Model class
  class MockModel {
    static create = jest.fn();
    static findByPk = jest.fn();
    static findOne = jest.fn();
    static findAll = jest.fn();
    static findAndCountAll = jest.fn();
    static update = jest.fn();
    static destroy = jest.fn();
    static count = jest.fn();
    static bulkCreate = jest.fn();
    static init = jest.fn();
    
    constructor() {}
    
    save = jest.fn();
    destroy = jest.fn();
    update = jest.fn();
    reload = jest.fn();
    toJSON = jest.fn();
  }
  
  return {
    Sequelize: jest.fn().mockImplementation(() => mockSequelize),
    Model: MockModel,
    DataTypes: {
      INTEGER: jest.fn().mockReturnValue('INTEGER'),
      STRING: jest.fn().mockReturnValue('STRING'),
      TEXT: jest.fn().mockReturnValue('TEXT'),
      DECIMAL: jest.fn().mockReturnValue('DECIMAL'),
      BOOLEAN: jest.fn().mockReturnValue('BOOLEAN'),
      DATE: jest.fn().mockReturnValue('DATE'),
      NOW: jest.fn().mockReturnValue('NOW'),
      ENUM: jest.fn().mockReturnValue('ENUM'),
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
  sign: jest.fn().mockImplementation((payload, secret, options) => {
    return 'mock-jwt-token';
  }),
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
  
  (mockExpress as any).json = jest.fn();
  (mockExpress as any).urlencoded = jest.fn();
  (mockExpress as any).static = jest.fn();
  
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

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Clean up after all tests
afterAll(() => {
  jest.restoreAllMocks();
});
