import bcrypt from 'bcryptjs';
import { Usuario } from '../models/Usuario';
import { Logger } from '../utils/helpers';
import { LoginDTO, RegisterDTO } from '../dto/AuthDTO';
import { TokenService } from './TokenService';

export interface LoginResult {
  user: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    activo: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(registerData: RegisterDTO): Promise<Usuario> {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(registerData.password, 10);

      // Create user
      const user = await Usuario.create({
        nombre: registerData.nombre,
        email: registerData.email,
        password: hashedPassword,
        rol: registerData.rol || 'vendedor',
        activo: true
      });

      Logger.info(`User registered successfully: ${user.email}`);
      return user;
    } catch (error) {
      Logger.error('Error in AuthService.register:', error);
      throw error;
    }
  }

  /**
   * Login user and return tokens
   */
  async login(loginData: LoginDTO): Promise<LoginResult | null> {
    try {
      // Find user by email
      const user = await Usuario.findOne({ 
        where: { 
          email: loginData.email,
          activo: true 
        } 
      });

      if (!user) {
        Logger.warn(`Login attempt with non-existent email: ${loginData.email}`);
        return null;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
      
      if (!isPasswordValid) {
        Logger.warn(`Invalid password attempt for user: ${user.email}`);
        return null;
      }

      // Generate tokens
      const { accessToken, refreshToken } = TokenService.generateTokenPair({
        id: user.id,
        email: user.email,
        rol: user.rol
      });

      Logger.info(`User logged in successfully: ${user.email}`);

      return {
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
          activo: user.activo
        },
        accessToken,
        refreshToken
      };
    } catch (error) {
      Logger.error('Error in AuthService.login:', error);
      throw error;
    }
  }


  /**
   * Verify and decode token
   */
  async verifyToken(token: string): Promise<any> {
    try {
      return TokenService.verifyToken(token);
    } catch (error) {
      Logger.error('Token verification failed:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string } | null> {
    try {
      const decoded = await this.verifyToken(refreshToken);
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      const user = await Usuario.findByPk(decoded.id);
      
      if (!user || !user.activo) {
        return null;
      }

      const newAccessToken = TokenService.generateAccessToken({
        id: user.id,
        email: user.email,
        rol: user.rol
      });
      
      Logger.info(`Access token refreshed for user: ${user.email}`);
      
      return { accessToken: newAccessToken };
    } catch (error) {
      Logger.error('Error refreshing access token:', error);
      return null;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<Usuario | null> {
    try {
      return await Usuario.findByPk(id);
    } catch (error) {
      Logger.error('Error getting user by ID:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(id: number, updateData: Partial<Usuario>): Promise<Usuario | null> {
    try {
      const user = await Usuario.findByPk(id);
      
      if (!user) {
        return null;
      }

      // If password is being updated, hash it
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }

      await user.update(updateData);
      
      Logger.info(`User updated: ${user.email}`);
      return user;
    } catch (error) {
      Logger.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const user = await Usuario.findByPk(userId);
      
      if (!user) {
        return false;
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      
      if (!isCurrentPasswordValid) {
        return false;
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await user.update({ password: hashedNewPassword });
      
      Logger.info(`Password changed for user: ${user.email}`);
      return true;
    } catch (error) {
      Logger.error('Error changing password:', error);
      throw error;
    }
  }
}
