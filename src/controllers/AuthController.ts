import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Usuario } from '../models/Usuario';
import { AuthService } from '../services/AuthService';
import { ResponseHelper } from '../utils/helpers';
import { LoginDTO, RegisterDTO } from '../dto/AuthDTO';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Register a new user
   */
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const registerData: RegisterDTO = req.body;

      // Validate required fields
      if (!registerData.nombre || !registerData.email || !registerData.password) {
        ResponseHelper.validationError(res, 'Missing required fields: nombre, email, password');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registerData.email)) {
        ResponseHelper.validationError(res, 'Invalid email format');
        return;
      }

      // Validate password strength
      if (registerData.password.length < 6) {
        ResponseHelper.validationError(res, 'Password must be at least 6 characters long');
        return;
      }

      // Validate role
      if (registerData.rol && !['admin', 'vendedor'].includes(registerData.rol)) {
        ResponseHelper.validationError(res, 'Role must be either admin or vendedor');
        return;
      }

      // Check if user already exists
      const existingUser = await Usuario.findOne({ where: { email: registerData.email } });
      if (existingUser) {
        ResponseHelper.error(res, 'User with this email already exists', 409);
        return;
      }

      // Create user
      const user = await this.authService.register(registerData);
      
      ResponseHelper.success(res, {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        activo: user.activo
      }, 'User registered successfully', 201);

    } catch (error) {
      ResponseHelper.error(res, 'Error registering user', 500, error);
    }
  };

  /**
   * Login user
   */
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const loginData: LoginDTO = req.body;

      // Validate required fields
      if (!loginData.email || !loginData.password) {
        ResponseHelper.validationError(res, 'Missing required fields: email, password');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(loginData.email)) {
        ResponseHelper.validationError(res, 'Invalid email format');
        return;
      }

      // Authenticate user
      const result = await this.authService.login(loginData);
      
      if (!result) {
        ResponseHelper.error(res, 'Invalid credentials', 401);
        return;
      }

      ResponseHelper.success(res, result, 'Login successful');

    } catch (error) {
      ResponseHelper.error(res, 'Error during login', 500, error);
    }
  };

  /**
   * Get current user profile
   */
  public getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      const user = await this.authService.getUserById(userId);
      
      if (!user) {
        ResponseHelper.error(res, 'User not found', 404);
        return;
      }

      ResponseHelper.success(res, {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        activo: user.activo
      }, 'Profile retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving profile', 500, error);
    }
  };

  /**
   * Update user profile
   */
  public updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const updateData = req.body;

      if (!userId) {
        ResponseHelper.error(res, 'User not authenticated', 401);
        return;
      }

      // Remove sensitive fields that shouldn't be updated via this endpoint
      delete updateData.password;
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      const user = await this.authService.updateUser(userId, updateData);
      
      if (!user) {
        ResponseHelper.error(res, 'User not found', 404);
        return;
      }

      ResponseHelper.success(res, {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        activo: user.activo
      }, 'Profile updated successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error updating profile', 500, error);
    }
  };
}
