import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/helpers';

export class SecurityMiddleware {
  /**
   * Rate limiting middleware (simple implementation)
   */
  private static requestCounts = new Map<string, { count: number; resetTime: number }>();
  
  public static rateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const clientId = req.ip || req.connection.remoteAddress || 'unknown';
      const now = Date.now();
      
      const clientData = SecurityMiddleware.requestCounts.get(clientId);
      
      if (!clientData || now > clientData.resetTime) {
        // Reset or initialize client data
        SecurityMiddleware.requestCounts.set(clientId, {
          count: 1,
          resetTime: now + windowMs
        });
        next();
        return;
      }
      
      if (clientData.count >= maxRequests) {
        Logger.warn(`Rate limit exceeded for client: ${clientId}`);
        res.status(429).json({
          success: false,
          message: 'Too many requests, please try again later',
          retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
        });
        return;
      }
      
      clientData.count++;
      next();
    };
  };

  /**
   * Request logging middleware
   */
  public static requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      };
      
      if (res.statusCode >= 400) {
        Logger.error('HTTP Request Error:', logData);
      } else {
        Logger.info('HTTP Request:', logData);
      }
    });
    
    next();
  };

  /**
   * CORS configuration middleware
   */
  public static corsOptions = {
    origin: (origin: string | undefined, callback: Function) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        Logger.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200
  };

  /**
   * Security headers middleware
   */
  public static securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
    // Remove X-Powered-By header
    res.removeHeader('X-Powered-By');
    
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    next();
  };

  /**
   * Input sanitization middleware
   */
  public static sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
    const sanitize = (obj: any): any => {
      if (typeof obj === 'string') {
        // Remove potentially dangerous characters
        return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                  .replace(/javascript:/gi, '')
                  .replace(/on\w+\s*=/gi, '');
      }
      
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }
      
      if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
          sanitized[key] = sanitize(obj[key]);
        }
        return sanitized;
      }
      
      return obj;
    };
    
    req.body = sanitize(req.body);
    req.query = sanitize(req.query);
    req.params = sanitize(req.params);
    
    next();
  };
}
