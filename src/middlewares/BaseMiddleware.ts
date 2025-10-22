import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from '../utils/helpers';
import { Logger } from '../utils/helpers';

/**
 * Base middleware class that provides common functionality for all middlewares
 * Implements Clean Code principles by eliminating code duplication
 */
export abstract class BaseMiddleware {
  protected readonly logger = Logger;

  /**
   * Handle middleware errors with consistent logging and response formatting
   */
  protected handleMiddlewareError(
    error: any,
    res: Response,
    context: string,
    statusCode: number = 500
  ): void {
    this.logger.error(`Error in ${context}:`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    ResponseHelper.error(res, `${context}: ${errorMessage}`, statusCode, error);
  }

  /**
   * Validate request parameters
   */
  protected validateRequestParams(req: Request, requiredParams: string[]): void {
    const missingParams = requiredParams.filter(param => 
      !req.params[param] || req.params[param].trim() === ''
    );

    if (missingParams.length > 0) {
      throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
    }
  }

  /**
   * Validate request body
   */
  protected validateRequestBody(req: Request, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => 
      req.body[field] === undefined || req.body[field] === null || req.body[field] === ''
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  /**
   * Validate request query
   */
  protected validateRequestQuery(req: Request, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => 
      req.query[field] === undefined || req.query[field] === null || req.query[field] === ''
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required query parameters: ${missingFields.join(', ')}`);
    }
  }

  /**
   * Validate request headers
   */
  protected validateRequestHeaders(req: Request, requiredHeaders: string[]): void {
    const missingHeaders = requiredHeaders.filter(header => 
      !req.headers[header] || req.headers[header] === ''
    );

    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }
  }

  /**
   * Sanitize request data
   */
  protected sanitizeRequestData(req: Request): void {
    req.body = this.sanitizeObject(req.body);
    req.query = this.sanitizeObject(req.query);
    req.params = this.sanitizeObject(req.params);
  }

  /**
   * Sanitize object recursively
   */
  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return obj.trim().replace(/[<>]/g, '');
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = this.sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    
    return obj;
  }

  /**
   * Parse numeric parameter
   */
  protected parseNumericParam(value: string, paramName: string): number {
    const numericValue = parseInt(value);
    
    if (isNaN(numericValue)) {
      throw new Error(`Invalid ${paramName}: must be a number`);
    }
    
    return numericValue;
  }

  /**
   * Parse date parameter
   */
  protected parseDateParam(value: string, paramName: string): Date {
    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid ${paramName}: must be a valid date`);
    }
    
    return date;
  }

  /**
   * Validate numeric parameter
   */
  protected validateNumericParam(value: any, paramName: string, min?: number, max?: number): void {
    const numericValue = Number(value);
    
    if (isNaN(numericValue)) {
      throw new Error(`Invalid ${paramName}: must be a number`);
    }
    
    if (min !== undefined && numericValue < min) {
      throw new Error(`Invalid ${paramName}: must be at least ${min}`);
    }
    
    if (max !== undefined && numericValue > max) {
      throw new Error(`Invalid ${paramName}: must be at most ${max}`);
    }
  }

  /**
   * Validate string parameter
   */
  protected validateStringParam(value: any, paramName: string, minLength?: number, maxLength?: number): void {
    if (typeof value !== 'string') {
      throw new Error(`Invalid ${paramName}: must be a string`);
    }
    
    const trimmedValue = value.trim();
    
    if (minLength !== undefined && trimmedValue.length < minLength) {
      throw new Error(`Invalid ${paramName}: must be at least ${minLength} characters`);
    }
    
    if (maxLength !== undefined && trimmedValue.length > maxLength) {
      throw new Error(`Invalid ${paramName}: must be at most ${maxLength} characters`);
    }
  }

  /**
   * Validate email parameter
   */
  protected validateEmailParam(value: any, paramName: string): void {
    if (typeof value !== 'string') {
      throw new Error(`Invalid ${paramName}: must be a string`);
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(value)) {
      throw new Error(`Invalid ${paramName}: must be a valid email address`);
    }
  }

  /**
   * Validate date parameter
   */
  protected validateDateParam(value: any, paramName: string): void {
    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid ${paramName}: must be a valid date`);
    }
  }

  /**
   * Validate date range
   */
  protected validateDateRange(startDate: Date, endDate: Date): void {
    if (startDate > endDate) {
      throw new Error('Start date must be before end date');
    }
  }

  /**
   * Validate pagination parameters
   */
  protected validatePaginationParams(page: number, limit: number): void {
    if (page < 1) {
      throw new Error('Page must be greater than 0');
    }
    
    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
  }

  /**
   * Extract pagination parameters from request
   */
  protected extractPaginationParams(req: Request): { page: number; limit: number; offset: number } {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    this.validatePaginationParams(page, limit);

    return { page, limit, offset };
  }

  /**
   * Extract filters from request query
   */
  protected extractFilters(req: Request, allowedFilters: string[]): Record<string, any> {
    const filters: Record<string, any> = {};
    
    for (const filter of allowedFilters) {
      if (req.query[filter] !== undefined) {
        filters[filter] = req.query[filter];
      }
    }
    
    return filters;
  }

  /**
   * Log request information
   */
  protected logRequest(req: Request, context: string): void {
    this.logger.info(`${context} request`, {
      method: req.method,
      url: req.url,
      user: req.user ? (req.user as any).id : 'anonymous',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log response information
   */
  protected logResponse(res: Response, context: string, statusCode: number): void {
    this.logger.info(`${context} response`, {
      statusCode,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Create error response
   */
  protected createErrorResponse(
    res: Response,
    message: string,
    statusCode: number = 500,
    error?: any
  ): void {
    ResponseHelper.error(res, message, statusCode, error);
  }

  /**
   * Create validation error response
   */
  protected createValidationErrorResponse(
    res: Response,
    message: string,
    details?: any
  ): void {
    ResponseHelper.validationError(res, message, details);
  }

  /**
   * Create bad request response
   */
  protected createBadRequestResponse(
    res: Response,
    message: string = 'Bad request'
  ): void {
    ResponseHelper.badRequest(res, message);
  }

  /**
   * Create unauthorized response
   */
  protected createUnauthorizedResponse(
    res: Response,
    message: string = 'Unauthorized access'
  ): void {
    ResponseHelper.unauthorized(res, message);
  }

  /**
   * Create forbidden response
   */
  protected createForbiddenResponse(
    res: Response,
    message: string = 'Insufficient permissions'
  ): void {
    ResponseHelper.forbidden(res, message);
  }

  /**
   * Create not found response
   */
  protected createNotFoundResponse(
    res: Response,
    resource: string = 'Resource'
  ): void {
    ResponseHelper.notFound(res, `${resource} not found`);
  }

  /**
   * Create internal error response
   */
  protected createInternalErrorResponse(
    res: Response,
    message: string = 'Internal server error'
  ): void {
    ResponseHelper.internalError(res, message);
  }

  /**
   * Wrap async middleware method with error handling
   */
  protected asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Check if request has required content type
   */
  protected validateContentType(req: Request, expectedType: string): void {
    const contentType = req.get('Content-Type');
    
    if (!contentType || !contentType.includes(expectedType)) {
      throw new Error(`Content-Type must be ${expectedType}`);
    }
  }

  /**
   * Check if request has required accept header
   */
  protected validateAcceptHeader(req: Request, expectedType: string): void {
    const accept = req.get('Accept');
    
    if (!accept || !accept.includes(expectedType)) {
      throw new Error(`Accept header must include ${expectedType}`);
    }
  }

  /**
   * Rate limiting helper
   */
  protected checkRateLimit(req: Request, limit: number, windowMs: number): boolean {
    // This is a simplified rate limiting implementation
    // In production, you would use a proper rate limiting library
    const key = req.ip;
    const now = Date.now();
    
    // Store rate limit data in memory (in production, use Redis)
    if (!global.rateLimitStore) {
      global.rateLimitStore = new Map();
    }
    
    const store = global.rateLimitStore;
    const userLimit = store.get(key as string) || { count: 0, resetTime: now + windowMs };
    
    if (now > userLimit.resetTime) {
      userLimit.count = 0;
      userLimit.resetTime = now + windowMs;
    }
    
    if (userLimit.count >= limit) {
      return false;
    }
    
    userLimit.count++;
    store.set(key as string, userLimit);
    
    return true;
  }

  /**
   * Generate audit log entry
   */
  protected generateAuditLog(
    req: Request,
    action: string,
    resource: string,
    resourceId?: number
  ): any {
    return {
      userId: req.user ? (req.user as any).id : null,
      action,
      resource,
      resourceId,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method,
      url: req.url
    };
  }

  /**
   * Validate request size
   */
  protected validateRequestSize(req: Request, maxSize: number): void {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    
    if (contentLength > maxSize) {
      throw new Error(`Request size exceeds maximum allowed size of ${maxSize} bytes`);
    }
  }

  /**
   * Validate request method
   */
  protected validateRequestMethod(req: Request, allowedMethods: string[]): void {
    if (!allowedMethods.includes(req.method)) {
      throw new Error(`Method ${req.method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`);
    }
  }
}

// Extend global namespace for rate limiting
declare global {
  var rateLimitStore: Map<string, { count: number; resetTime: number }>;
}
