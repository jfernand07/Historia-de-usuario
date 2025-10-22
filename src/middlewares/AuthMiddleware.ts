import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/TokenService';
import { AuthService } from '../services/AuthService';
import { ResponseHelper } from '../utils/helpers';
import { Logger } from '../utils/helpers';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        rol: string;
      };
    }
  }
}

export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Middleware to verify JWT token
   */
  public verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        ResponseHelper.error(res, 'Authorization header missing or invalid', 401);
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      // Verify the token
      const decoded = await this.authService.verifyToken(token);
      
      // Check if token is expired
      if (TokenService.isTokenExpired(token)) {
        ResponseHelper.error(res, 'Token has expired', 401);
        return;
      }

      // Get user from database to ensure they still exist and are active
      const user = await this.authService.getUserById(decoded.id);
      
      if (!user || !user.activo) {
        ResponseHelper.error(res, 'User not found or inactive', 401);
        return;
      }

      // Attach user info to request
      req.user = {
        id: user.id,
        email: user.email,
        rol: user.rol
      };

      next();
    } catch (error) {
      Logger.error('Token verification error:', error);
      ResponseHelper.error(res, 'Invalid token', 401);
    }
  };

  /**
   * Middleware to check if user has admin role
   */
  public requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseHelper.error(res, 'Authentication required', 401);
      return;
    }

    if (req.user.rol !== 'admin') {
      ResponseHelper.error(res, 'Admin access required', 403);
      return;
    }

    next();
  };

  /**
   * Middleware to check if user has vendedor role
   */
  public requireVendedor = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseHelper.error(res, 'Authentication required', 401);
      return;
    }

    if (req.user.rol !== 'vendedor') {
      ResponseHelper.error(res, 'Vendedor access required', 403);
      return;
    }

    next();
  };

  /**
   * Middleware to check if user has admin or vendedor role
   */
  public requireAdminOrVendedor = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseHelper.error(res, 'Authentication required', 401);
      return;
    }

    if (!['admin', 'vendedor'].includes(req.user.rol)) {
      ResponseHelper.error(res, 'Admin or Vendedor access required', 403);
      return;
    }

    next();
  };

  /**
   * Middleware to check if user can access their own resource or is admin
   */
  public requireOwnershipOrAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseHelper.error(res, 'Authentication required', 401);
      return;
    }

    const resourceUserId = parseInt(req.params.userId || req.params.id);
    
    // Admin can access any resource
    if (req.user.rol === 'admin') {
      next();
      return;
    }

    // User can only access their own resource
    if (req.user.id === resourceUserId) {
      next();
      return;
    }

    ResponseHelper.error(res, 'Access denied: You can only access your own resources', 403);
  };

  /**
   * Optional authentication middleware (doesn't fail if no token)
   */
  public optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next();
        return;
      }

      const token = authHeader.substring(7);
      
      // Verify the token
      const decoded = await this.authService.verifyToken(token);
      
      // Check if token is expired
      if (TokenService.isTokenExpired(token)) {
        next();
        return;
      }

      // Get user from database
      const user = await this.authService.getUserById(decoded.id);
      
      if (user && user.activo) {
        req.user = {
          id: user.id,
          email: user.email,
          rol: user.rol
        };
      }

      next();
    } catch (error) {
      // Continue without authentication if token is invalid
      next();
    }
  };
}
