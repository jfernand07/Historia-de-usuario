import { Request, Response, NextFunction } from 'express';
import { AuthMiddleware } from '../../middlewares/AuthMiddleware';
import { TokenService } from '../../services/TokenService';
import { UsuarioDAO } from '../../dao/UsuarioDAO';
import { ResponseHelper } from '../../utils/helpers';

// Mock dependencies
jest.mock('../../services/TokenService');
jest.mock('../../dao/UsuarioDAO');
jest.mock('../../utils/helpers');

const MockedTokenService = TokenService as any;
const MockedUsuarioDAO = UsuarioDAO as any;
const MockedResponseHelper = ResponseHelper as any;

describe('AuthMiddleware', () => {
  let authMiddleware: AuthMiddleware;
  let mockTokenService: any;
  let mockUsuarioDAO: any;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    authMiddleware = new AuthMiddleware();
    mockTokenService = new TokenService();
    mockUsuarioDAO = new UsuarioDAO();
    
    mockRequest = {
      headers: {},
      user: undefined
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('verifyToken', () => {
    it('should verify token successfully and set user', async () => {
      // Arrange
      const token = 'valid-jwt-token';
      const mockUser = {
        id: 1,
        nombre: 'Admin User',
        email: 'admin@sportsline.com',
        rol: 'admin',
        activo: true
      };

      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      MockedTokenService.prototype.verifyAccessToken = jest.fn().mockResolvedValue({ userId: 1 });
      MockedUsuarioDAO.prototype.findById = jest.fn().mockResolvedValue(mockUser);

      // Act
      await authMiddleware.verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(MockedTokenService.prototype.verifyAccessToken).toHaveBeenCalledWith(token);
      expect(MockedUsuarioDAO.prototype.findById).toHaveBeenCalledWith(1);
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return error for missing authorization header', async () => {
      // Arrange
      mockRequest.headers = {};

      // Act
      await authMiddleware.verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(MockedResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Authorization header is required',
        401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return error for invalid token format', async () => {
      // Arrange
      mockRequest.headers = {
        authorization: 'InvalidFormat token'
      };

      // Act
      await authMiddleware.verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(MockedResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Invalid token format',
        401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return error for invalid token', async () => {
      // Arrange
      const token = 'invalid-jwt-token';
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      MockedTokenService.prototype.verifyAccessToken = jest.fn().mockRejectedValue(new Error('Invalid token'));

      // Act
      await authMiddleware.verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(MockedResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Invalid or expired token',
        401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return error for inactive user', async () => {
      // Arrange
      const token = 'valid-jwt-token';
      const mockUser = {
        id: 1,
        nombre: 'Admin User',
        email: 'admin@sportsline.com',
        rol: 'admin',
        activo: false
      };

      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      MockedTokenService.prototype.verifyAccessToken = jest.fn().mockResolvedValue({ userId: 1 });
      MockedUsuarioDAO.prototype.findById = jest.fn().mockResolvedValue(mockUser);

      // Act
      await authMiddleware.verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(MockedResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'User account is inactive',
        401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return error for non-existent user', async () => {
      // Arrange
      const token = 'valid-jwt-token';
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      MockedTokenService.prototype.verifyAccessToken = jest.fn().mockResolvedValue({ userId: 999 });
      MockedUsuarioDAO.prototype.findById = jest.fn().mockResolvedValue(null);

      // Act
      await authMiddleware.verifyToken(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(MockedResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'User not found',
        401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('should allow access for admin user', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        nombre: 'Admin User',
        email: 'admin@sportsline.com',
        rol: 'admin',
        activo: true
      };

      mockRequest.user = mockUser;

      // Act
      await authMiddleware.requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access for non-admin user', async () => {
      // Arrange
      const mockUser = {
        id: 2,
        nombre: 'Vendedor User',
        email: 'vendedor@sportsline.com',
        rol: 'vendedor',
        activo: true
      };

      mockRequest.user = mockUser;

      // Act
      await authMiddleware.requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(MockedResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Admin access required',
        403
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access for unauthenticated user', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await authMiddleware.requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(MockedResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Authentication required',
        401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAdminOrVendedor', () => {
    it('should allow access for admin user', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        nombre: 'Admin User',
        email: 'admin@sportsline.com',
        rol: 'admin',
        activo: true
      };

      mockRequest.user = mockUser;

      // Act
      await authMiddleware.requireAdminOrVendedor(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow access for vendedor user', async () => {
      // Arrange
      const mockUser = {
        id: 2,
        nombre: 'Vendedor User',
        email: 'vendedor@sportsline.com',
        rol: 'vendedor',
        activo: true
      };

      mockRequest.user = mockUser;

      // Act
      await authMiddleware.requireAdminOrVendedor(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access for unauthenticated user', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await authMiddleware.requireAdminOrVendedor(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(MockedResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Authentication required',
        401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireVendedor', () => {
    it('should allow access for vendedor user', async () => {
      // Arrange
      const mockUser = {
        id: 2,
        nombre: 'Vendedor User',
        email: 'vendedor@sportsline.com',
        rol: 'vendedor',
        activo: true
      };

      mockRequest.user = mockUser;

      // Act
      await authMiddleware.requireVendedor(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access for admin user', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        nombre: 'Admin User',
        email: 'admin@sportsline.com',
        rol: 'admin',
        activo: true
      };

      mockRequest.user = mockUser;

      // Act
      await authMiddleware.requireVendedor(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(MockedResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Vendedor access required',
        403
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access for unauthenticated user', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await authMiddleware.requireVendedor(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(MockedResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Authentication required',
        401
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('should set user when valid token is provided', async () => {
      // Arrange
      const token = 'valid-jwt-token';
      const mockUser = {
        id: 1,
        nombre: 'Admin User',
        email: 'admin@sportsline.com',
        rol: 'admin',
        activo: true
      };

      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      MockedTokenService.prototype.verifyAccessToken = jest.fn().mockResolvedValue({ userId: 1 });
      MockedUsuarioDAO.prototype.findById = jest.fn().mockResolvedValue(mockUser);

      // Act
      await authMiddleware.optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without user when no token is provided', async () => {
      // Arrange
      mockRequest.headers = {};

      // Act
      await authMiddleware.optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without user when invalid token is provided', async () => {
      // Arrange
      const token = 'invalid-jwt-token';
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      MockedTokenService.prototype.verifyAccessToken = jest.fn().mockRejectedValue(new Error('Invalid token'));

      // Act
      await authMiddleware.optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });
});