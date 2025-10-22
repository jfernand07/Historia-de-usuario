import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from '../utils/helpers';
import { Logger } from '../utils/helpers';

/**
 * Base controller class that provides common functionality for all controllers
 * Implements Clean Code principles by eliminating code duplication
 */
export abstract class BaseController {
  protected readonly logger = Logger;

  /**
   * Handle controller errors with consistent logging and response formatting
   */
  protected handleControllerError(
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
   * Validate user authentication
   */
  protected validateAuthentication(req: Request): void {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
  }

  /**
   * Validate user role
   */
  protected validateUserRole(req: Request, requiredRoles: string[]): void {
    this.validateAuthentication(req);
    
    const user = req.user as any;
    if (!requiredRoles.includes(user.rol)) {
      throw new Error(`Required roles: ${requiredRoles.join(', ')}`);
    }
  }

  /**
   * Validate user is active
   */
  protected validateUserActive(req: Request): void {
    this.validateAuthentication(req);
    
    const user = req.user as any;
    if (!user.activo) {
      throw new Error('User account is inactive');
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
   * Create success response
   */
  protected createSuccessResponse(
    res: Response,
    data: any,
    message: string = 'Operation completed successfully',
    statusCode: number = 200
  ): void {
    ResponseHelper.success(res, data, message, statusCode);
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
   * Create not found response
   */
  protected createNotFoundResponse(
    res: Response,
    resource: string = 'Resource'
  ): void {
    ResponseHelper.notFound(res, `${resource} not found`);
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
   * Create bad request response
   */
  protected createBadRequestResponse(
    res: Response,
    message: string = 'Bad request'
  ): void {
    ResponseHelper.badRequest(res, message);
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
   * Wrap async controller method with error handling
   */
  protected asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
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
      userAgent: req.get('User-Agent')
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
   * Check if request has required headers
   */
  protected validateRequiredHeaders(req: Request, requiredHeaders: string[]): void {
    const missingHeaders = requiredHeaders.filter(header => 
      !req.headers[header] || req.headers[header] === ''
    );

    if (missingHeaders.length > 0) {
      throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
    }
  }

  /**
   * Extract user from request
   */
  protected extractUser(req: Request): any {
    this.validateAuthentication(req);
    return req.user;
  }

  /**
   * Extract user ID from request
   */
  protected extractUserId(req: Request): number {
    const user = this.extractUser(req);
    return user.id;
  }

  /**
   * Extract user role from request
   */
  protected extractUserRole(req: Request): string {
    const user = this.extractUser(req);
    return user.rol;
  }

  /**
   * Check if user is admin
   */
  protected isAdmin(req: Request): boolean {
    try {
      const role = this.extractUserRole(req);
      return role === 'admin';
    } catch {
      return false;
    }
  }

  /**
   * Check if user is vendedor
   */
  protected isVendedor(req: Request): boolean {
    try {
      const role = this.extractUserRole(req);
      return role === 'vendedor';
    } catch {
      return false;
    }
  }

  /**
   * Check if user has any of the required roles
   */
  protected hasAnyRole(req: Request, roles: string[]): boolean {
    try {
      const userRole = this.extractUserRole(req);
      return roles.includes(userRole);
    } catch {
      return false;
    }
  }

  /**
   * Format pagination response
   */
  protected formatPaginationResponse(
    data: any[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
    message: string = 'Data retrieved successfully'
  ): any {
    return {
      data,
      pagination,
      message
    };
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
      userId: this.extractUserId(req),
      action,
      resource,
      resourceId,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };
  }
}
