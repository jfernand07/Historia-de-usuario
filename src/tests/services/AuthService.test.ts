import { AuthService } from '../../services/AuthService';
import { UsuarioDAO } from '../../dao/UsuarioDAO';
import { TokenService } from '../../services/TokenService';
import { Logger } from '../../utils/helpers';

// Mock dependencies
jest.mock('../../dao/UsuarioDAO');
jest.mock('../../services/TokenService');
jest.mock('../../utils/helpers');

const MockedUsuarioDAO = UsuarioDAO as any;
const MockedTokenService = TokenService as any;
const MockedLogger = Logger as any;

describe('AuthService', () => {
  let authService: AuthService;
  let mockUsuarioDAO: any;
  let mockTokenService: any;

  beforeEach(() => {
    authService = new AuthService();
    mockUsuarioDAO = new UsuarioDAO();
    mockTokenService = new TokenService();
    
    jest.clearAllMocks();
  });

  describe('validateCredentials', () => {
    it('should return user for valid credentials', async () => {
      // Arrange
      const email = 'admin@sportsline.com';
      const password = 'password123';
      const hashedPassword = '$2b$10$hashedpassword';
      
      const mockUser = {
        id: 1,
        nombre: 'Admin User',
        email: email,
        password: hashedPassword,
        rol: 'admin',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      MockedUsuarioDAO.prototype.findByEmail = jest.fn().mockResolvedValue(mockUser);
      
      // Mock bcrypt compare
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      // Act
      const result = await authService.validateCredentials(email, password);

      // Assert
      expect(MockedUsuarioDAO.prototype.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(mockUser);
    });

    it('should return null for invalid email', async () => {
      // Arrange
      const email = 'nonexistent@sportsline.com';
      const password = 'password123';

      MockedUsuarioDAO.prototype.findByEmail = jest.fn().mockResolvedValue(null);

      // Act
      const result = await authService.validateCredentials(email, password);

      // Assert
      expect(MockedUsuarioDAO.prototype.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeNull();
    });

    it('should return null for invalid password', async () => {
      // Arrange
      const email = 'admin@sportsline.com';
      const password = 'wrongpassword';
      const hashedPassword = '$2b$10$hashedpassword';
      
      const mockUser = {
        id: 1,
        nombre: 'Admin User',
        email: email,
        password: hashedPassword,
        rol: 'admin',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      MockedUsuarioDAO.prototype.findByEmail = jest.fn().mockResolvedValue(mockUser);
      
      // Mock bcrypt compare
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      // Act
      const result = await authService.validateCredentials(email, password);

      // Assert
      expect(MockedUsuarioDAO.prototype.findByEmail).toHaveBeenCalledWith(email);
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      // Arrange
      const email = 'admin@sportsline.com';
      const password = 'password123';

      MockedUsuarioDAO.prototype.findByEmail = jest.fn().mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(authService.validateCredentials(email, password))
        .rejects.toThrow('Database error');
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      // Arrange
      const userData = {
        nombre: 'New User',
        email: 'newuser@sportsline.com',
        password: 'password123',
        rol: 'vendedor' as const
      };

      const hashedPassword = '$2b$10$hashedpassword';
      const mockCreatedUser = {
        id: 3,
        nombre: userData.nombre,
        email: userData.email,
        password: hashedPassword,
        rol: userData.rol,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      MockedUsuarioDAO.prototype.findByEmail = jest.fn().mockResolvedValue(null);
      MockedUsuarioDAO.prototype.create = jest.fn().mockResolvedValue(mockCreatedUser);
      
      // Mock bcrypt hash
      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);

      // Act
      const result = await authService.createUser(userData);

      // Assert
      expect(MockedUsuarioDAO.prototype.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(MockedUsuarioDAO.prototype.create).toHaveBeenCalledWith({
        ...userData,
        password: hashedPassword,
        activo: true
      });
      expect(result).toEqual(mockCreatedUser);
    });

    it('should throw error for existing email', async () => {
      // Arrange
      const userData = {
        nombre: 'New User',
        email: 'existing@sportsline.com',
        password: 'password123',
        rol: 'vendedor' as const
      };

      const existingUser = {
        id: 1,
        email: userData.email,
        nombre: 'Existing User',
        rol: 'admin',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      MockedUsuarioDAO.prototype.findByEmail = jest.fn().mockResolvedValue(existingUser);

      // Act & Assert
      await expect(authService.createUser(userData))
        .rejects.toThrow('Email already exists');
    });

    it('should handle database errors during creation', async () => {
      // Arrange
      const userData = {
        nombre: 'New User',
        email: 'newuser@sportsline.com',
        password: 'password123',
        rol: 'vendedor' as const
      };

      MockedUsuarioDAO.prototype.findByEmail = jest.fn().mockResolvedValue(null);
      MockedUsuarioDAO.prototype.create = jest.fn().mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(authService.createUser(userData))
        .rejects.toThrow('Database error');
    });
  });

  describe('generateTokens', () => {
    it('should generate tokens successfully', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        nombre: 'Admin User',
        email: 'admin@sportsline.com',
        rol: 'admin',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockTokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600
      };

      MockedTokenService.prototype.generateAccessToken = jest.fn().mockResolvedValue(mockTokens.accessToken);
      MockedTokenService.prototype.generateRefreshToken = jest.fn().mockResolvedValue(mockTokens.refreshToken);

      // Act
      const result = await authService.generateTokens(mockUser as any);

      // Assert
      expect(MockedTokenService.prototype.generateAccessToken).toHaveBeenCalledWith(mockUser);
      expect(MockedTokenService.prototype.generateRefreshToken).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        expiresIn: 3600
      });
    });

    it('should handle token generation errors', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        nombre: 'Admin User',
        email: 'admin@sportsline.com',
        rol: 'admin',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      MockedTokenService.prototype.generateAccessToken = jest.fn().mockRejectedValue(new Error('Token generation error'));

      // Act & Assert
      await expect(authService.generateTokens(mockUser as any))
        .rejects.toThrow('Token generation error');
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh access token successfully', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      const mockUser = {
        id: 1,
        nombre: 'Admin User',
        email: 'admin@sportsline.com',
        rol: 'admin',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const newAccessToken = 'new-access-token';

      MockedTokenService.prototype.verifyRefreshToken = jest.fn().mockResolvedValue({ userId: mockUser.id });
      MockedUsuarioDAO.prototype.findById = jest.fn().mockResolvedValue(mockUser);
      MockedTokenService.prototype.generateAccessToken = jest.fn().mockResolvedValue(newAccessToken);

      // Act
      const result = await authService.refreshAccessToken(refreshToken);

      // Assert
      expect(MockedTokenService.prototype.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(MockedUsuarioDAO.prototype.findById).toHaveBeenCalledWith(mockUser.id);
      expect(MockedTokenService.prototype.generateAccessToken).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({
        accessToken: newAccessToken,
        expiresIn: 3600
      });
    });

    it('should throw error for invalid refresh token', async () => {
      // Arrange
      const refreshToken = 'invalid-refresh-token';

      MockedTokenService.prototype.verifyRefreshToken = jest.fn().mockRejectedValue(new Error('Invalid refresh token'));

      // Act & Assert
      await expect(authService.refreshAccessToken(refreshToken))
        .rejects.toThrow('Invalid refresh token');
    });

    it('should throw error for inactive user', async () => {
      // Arrange
      const refreshToken = 'valid-refresh-token';
      const mockUser = {
        id: 1,
        nombre: 'Admin User',
        email: 'admin@sportsline.com',
        rol: 'admin',
        activo: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      MockedTokenService.prototype.verifyRefreshToken = jest.fn().mockResolvedValue({ userId: mockUser.id });
      MockedUsuarioDAO.prototype.findById = jest.fn().mockResolvedValue(mockUser);

      // Act & Assert
      await expect(authService.refreshAccessToken(refreshToken))
        .rejects.toThrow('User account is inactive');
    });
  });
});