import { Request, Response } from 'express';
import { AuthController } from '../../src/controllers/AuthController';
import { AuthService } from '../../src/services/AuthService';
import { UsuarioDAO } from '../../src/dao/UsuarioDAO';
import { ResponseHelper } from '../../src/utils/helpers';

// Mock dependencies
jest.mock('../../src/services/AuthService');
jest.mock('../../src/dao/UsuarioDAO');
jest.mock('../../src/utils/helpers');

describe('AuthController', () => {
  let authController: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockUsuarioDAO: jest.Mocked<UsuarioDAO>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    authController = new AuthController();
    mockAuthService = new AuthService() as jest.Mocked<AuthService>;
    mockUsuarioDAO = new UsuarioDAO() as jest.Mocked<UsuarioDAO>;
    
    mockRequest = {
      body: {},
      user: undefined
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const loginData = {
        email: 'admin@sportsline.com',
        password: 'password123'
      };
      
      const mockUser = {
        id: 1,
        nombre: 'Admin User',
        email: 'admin@sportsline.com',
        rol: 'admin',
        activo: true
      };

      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600
      };

      mockRequest.body = loginData;
      
      mockAuthService.validateCredentials = jest.fn().mockResolvedValue(mockUser);
      mockAuthService.generateTokens = jest.fn().mockResolvedValue(mockTokens);

      // Act
      await authController.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockAuthService.validateCredentials).toHaveBeenCalledWith(loginData.email, loginData.password);
      expect(mockAuthService.generateTokens).toHaveBeenCalledWith(mockUser);
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          user: mockUser,
          accessToken: mockTokens.accessToken,
          refreshToken: mockTokens.refreshToken,
          expiresIn: mockTokens.expiresIn
        }),
        'Login successful'
      );
    });

    it('should return error for invalid credentials', async () => {
      // Arrange
      const loginData = {
        email: 'admin@sportsline.com',
        password: 'wrongpassword'
      };

      mockRequest.body = loginData;
      mockAuthService.validateCredentials = jest.fn().mockResolvedValue(null);

      // Act
      await authController.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockAuthService.validateCredentials).toHaveBeenCalledWith(loginData.email, loginData.password);
      expect(ResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Invalid credentials',
        401
      );
    });

    it('should return error for inactive user', async () => {
      // Arrange
      const loginData = {
        email: 'inactive@sportsline.com',
        password: 'password123'
      };

      const mockUser = {
        id: 2,
        nombre: 'Inactive User',
        email: 'inactive@sportsline.com',
        rol: 'vendedor',
        activo: false
      };

      mockRequest.body = loginData;
      mockAuthService.validateCredentials = jest.fn().mockResolvedValue(mockUser);

      // Act
      await authController.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(ResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'User account is inactive',
        401
      );
    });

    it('should handle service errors', async () => {
      // Arrange
      const loginData = {
        email: 'admin@sportsline.com',
        password: 'password123'
      };

      mockRequest.body = loginData;
      mockAuthService.validateCredentials = jest.fn().mockRejectedValue(new Error('Database error'));

      // Act
      await authController.login(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(ResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Error during login',
        500,
        expect.any(Error)
      );
    });
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      // Arrange
      const registerData = {
        nombre: 'New User',
        email: 'newuser@sportsline.com',
        password: 'password123',
        rol: 'vendedor'
      };

      const mockUser = {
        id: 3,
        ...registerData,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockRequest.body = registerData;
      
      mockAuthService.createUser = jest.fn().mockResolvedValue(mockUser);

      // Act
      await authController.register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockAuthService.createUser).toHaveBeenCalledWith(registerData);
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          id: mockUser.id,
          nombre: mockUser.nombre,
          email: mockUser.email,
          rol: mockUser.rol
        }),
        'User registered successfully',
        201
      );
    });

    it('should return error for duplicate email', async () => {
      // Arrange
      const registerData = {
        nombre: 'New User',
        email: 'existing@sportsline.com',
        password: 'password123',
        rol: 'vendedor'
      };

      mockRequest.body = registerData;
      mockAuthService.createUser = jest.fn().mockRejectedValue(new Error('Email already exists'));

      // Act
      await authController.register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(ResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'Error creating user',
        400,
        expect.any(Error)
      );
    });

    it('should validate required fields', async () => {
      // Arrange
      const invalidData = {
        nombre: 'New User',
        // Missing email, password, rol
      };

      mockRequest.body = invalidData;

      // Act
      await authController.register(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(ResponseHelper.validationError).toHaveBeenCalledWith(
        mockResponse,
        expect.any(String)
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile successfully', async () => {
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
      await authController.getProfile(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(ResponseHelper.success).toHaveBeenCalledWith(
        mockResponse,
        mockUser,
        'Profile retrieved successfully'
      );
    });

    it('should return error when user not authenticated', async () => {
      // Arrange
      mockRequest.user = undefined;

      // Act
      await authController.getProfile(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(ResponseHelper.error).toHaveBeenCalledWith(
        mockResponse,
        'User not authenticated',
        401
      );
    });
  });
});
