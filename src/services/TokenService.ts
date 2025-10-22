import jwt from 'jsonwebtoken';
import { config } from '../config';
import { Logger } from '../utils/helpers';

export interface TokenPayload {
  id: number;
  email: string;
  rol: string;
  type?: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export class TokenService {
  /**
   * Generate access token
   */
  static generateAccessToken(payload: Omit<TokenPayload, 'type' | 'iat' | 'exp' | 'iss' | 'aud'>): string {
    const tokenPayload: TokenPayload = {
      ...payload,
      type: 'access'
    };

    return jwt.sign(tokenPayload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      issuer: 'sportsline-api',
      audience: 'sportsline-client'
    });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: Pick<TokenPayload, 'id'>): string {
    const tokenPayload: TokenPayload = {
      id: payload.id,
      type: 'refresh'
    };

    return jwt.sign(tokenPayload, config.jwt.secret, {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: 'sportsline-api',
      audience: 'sportsline-client'
    });
  }

  /**
   * Verify and decode token
   */
  static verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.secret, {
        issuer: 'sportsline-api',
        audience: 'sportsline-client'
      }) as TokenPayload;

      return decoded;
    } catch (error) {
      Logger.error('Token verification failed:', error);
      throw new Error('Invalid token');
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload;
    } catch (error) {
      Logger.error('Token decode failed:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      Logger.error('Error checking token expiration:', error);
      return true;
    }
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return null;
      }

      return new Date(decoded.exp * 1000);
    } catch (error) {
      Logger.error('Error getting token expiration:', error);
      return null;
    }
  }

  /**
   * Generate token pair (access + refresh)
   */
  static generateTokenPair(userPayload: Omit<TokenPayload, 'type' | 'iat' | 'exp' | 'iss' | 'aud'>): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessToken = this.generateAccessToken(userPayload);
    const refreshToken = this.generateRefreshToken({ id: userPayload.id });

    return {
      accessToken,
      refreshToken
    };
  }
}
