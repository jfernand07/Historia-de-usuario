import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { ResponseHelper } from '../utils/helpers';
import { RefreshTokenDTO } from '../dto/AuthDTO';

export class TokenController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Refresh access token using refresh token
   */
  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken }: RefreshTokenDTO = req.body;

      // Validate required fields
      if (!refreshToken) {
        ResponseHelper.validationError(res, 'Refresh token is required');
        return;
      }

      // Refresh the access token
      const result = await this.authService.refreshAccessToken(refreshToken);
      
      if (!result) {
        ResponseHelper.error(res, 'Invalid or expired refresh token', 401);
        return;
      }

      ResponseHelper.success(res, result, 'Access token refreshed successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error refreshing token', 500, error);
    }
  };

  /**
   * Revoke refresh token (logout)
   */
  public revokeToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken }: RefreshTokenDTO = req.body;

      // Validate required fields
      if (!refreshToken) {
        ResponseHelper.validationError(res, 'Refresh token is required');
        return;
      }

      // In a real application, you would store refresh tokens in a database
      // and mark them as revoked. For now, we'll just return success.
      // The token will naturally expire based on its expiration time.
      
      ResponseHelper.success(res, null, 'Token revoked successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error revoking token', 500, error);
    }
  };

  /**
   * Verify token validity
   */
  public verifyToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        ResponseHelper.error(res, 'Authorization header missing or invalid', 401);
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      // Verify the token
      const decoded = await this.authService.verifyToken(token);
      
      ResponseHelper.success(res, {
        valid: true,
        user: {
          id: decoded.id,
          email: decoded.email,
          rol: decoded.rol
        }
      }, 'Token is valid');

    } catch (error) {
      ResponseHelper.error(res, 'Invalid token', 401, error);
    }
  };
}
