import { Logger } from '../utils/helpers';

/**
 * Base service class that provides common functionality for all services
 * Implements Clean Code principles by eliminating code duplication
 */
export abstract class BaseService {
  protected readonly logger = Logger;

  /**
   * Handle service errors with consistent logging and error formatting
   */
  protected handleServiceError(error: any, context: string): never {
    this.logger.error(`Error in ${context}:`, error);
    
    if (error instanceof Error) {
      throw new Error(`${context}: ${error.message}`);
    }
    
    throw new Error(`${context}: Unknown error occurred`);
  }

  /**
   * Validate required parameters
   */
  protected validateRequiredParams(params: Record<string, any>, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => 
      params[field] === undefined || params[field] === null || params[field] === ''
    );

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  /**
   * Validate numeric parameters
   */
  protected validateNumericParams(params: Record<string, any>, numericFields: string[]): void {
    const invalidFields = numericFields.filter(field => {
      const value = params[field];
      return value !== undefined && (isNaN(Number(value)) || Number(value) < 0);
    });

    if (invalidFields.length > 0) {
      throw new Error(`Invalid numeric fields: ${invalidFields.join(', ')}`);
    }
  }

  /**
   * Validate string parameters
   */
  protected validateStringParams(params: Record<string, any>, stringFields: string[]): void {
    const invalidFields = stringFields.filter(field => {
      const value = params[field];
      return value !== undefined && (typeof value !== 'string' || value.trim().length === 0);
    });

    if (invalidFields.length > 0) {
      throw new Error(`Invalid string fields: ${invalidFields.join(', ')}`);
    }
  }

  /**
   * Sanitize input data
   */
  protected sanitizeInput(data: any): any {
    if (typeof data === 'string') {
      return data.trim().replace(/[<>]/g, '');
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeInput(item));
    }
    
    if (data && typeof data === 'object') {
      const sanitized: any = {};
      for (const key in data) {
        sanitized[key] = this.sanitizeInput(data[key]);
      }
      return sanitized;
    }
    
    return data;
  }

  /**
   * Format response data consistently
   */
  protected formatResponse<T>(data: T, message: string = 'Operation completed successfully'): {
    success: boolean;
    data: T;
    message: string;
    timestamp: string;
  } {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Format error response consistently
   */
  protected formatErrorResponse(error: string, statusCode: number = 500): {
    success: boolean;
    error: string;
    statusCode: number;
    timestamp: string;
  } {
    return {
      success: false,
      error,
      statusCode,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Check if user has required role
   */
  protected hasRequiredRole(user: any, requiredRoles: string[]): boolean {
    if (!user || !user.rol) {
      return false;
    }
    
    return requiredRoles.includes(user.rol);
  }

  /**
   * Check if user is active
   */
  protected isUserActive(user: any): boolean {
    return user && user.activo === true;
  }

  /**
   * Generate pagination metadata
   */
  protected generatePaginationMetadata(page: number, limit: number, total: number): {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } {
    const totalPages = Math.ceil(total / limit);
    
    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  /**
   * Calculate offset for pagination
   */
  protected calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
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
   * Format date consistently
   */
  protected formatDate(date: Date): string {
    return date.toISOString();
  }

  /**
   * Parse date from string
   */
  protected parseDate(dateString: string): Date {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    
    return date;
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
   * Generate unique identifier
   */
  protected generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Deep clone object
   */
  protected deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (obj instanceof Date) {
      return new Date(obj.getTime()) as any;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item)) as any;
    }
    
    const cloned: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    
    return cloned;
  }

  /**
   * Merge objects deeply
   */
  protected deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const result = this.deepClone(target);
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(result[key] || {}, source[key] as any);
        } else {
          result[key] = source[key] as any;
        }
      }
    }
    
    return result;
  }

  /**
   * Check if object is empty
   */
  protected isEmpty(obj: any): boolean {
    if (obj === null || obj === undefined) {
      return true;
    }
    
    if (typeof obj === 'string' || Array.isArray(obj)) {
      return obj.length === 0;
    }
    
    if (typeof obj === 'object') {
      return Object.keys(obj).length === 0;
    }
    
    return false;
  }

  /**
   * Retry operation with exponential backoff
   */
  protected async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          break;
        }
        
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  /**
   * Execute operation with timeout
   */
  protected async withTimeout<T>(
    operation: Promise<T>,
    timeoutMs: number = 5000
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), timeoutMs);
    });
    
    return Promise.race([operation, timeoutPromise]);
  }
}
