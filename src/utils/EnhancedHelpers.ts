import { Response } from 'express';
import { Logger } from './helpers';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';

/**
 * Enhanced ResponseHelper with Clean Code principles
 * Eliminates code duplication and provides consistent response formatting
 */
export class ResponseHelper {
  /**
   * Send success response
   */
  static success(
    res: Response,
    data: any,
    message: string = SUCCESS_MESSAGES.RETRIEVED,
    statusCode: number = HTTP_STATUS.OK
  ): void {
    res.status(statusCode).json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string = ERROR_MESSAGES.INTERNAL_ERROR,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    error?: any
  ): void {
    const response: any = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (error && process.env.NODE_ENV === 'development') {
      response.error = error;
    }

    res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  static validationError(
    res: Response,
    message: string = ERROR_MESSAGES.VALIDATION_ERROR,
    details?: any
  ): void {
    res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
      success: false,
      message,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send not found response
   */
  static notFound(
    res: Response,
    message: string = ERROR_MESSAGES.NOT_FOUND
  ): void {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send unauthorized response
   */
  static unauthorized(
    res: Response,
    message: string = ERROR_MESSAGES.UNAUTHORIZED
  ): void {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send forbidden response
   */
  static forbidden(
    res: Response,
    message: string = ERROR_MESSAGES.FORBIDDEN
  ): void {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send bad request response
   */
  static badRequest(
    res: Response,
    message: string = ERROR_MESSAGES.BAD_REQUEST
  ): void {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send conflict response
   */
  static conflict(
    res: Response,
    message: string = ERROR_MESSAGES.CONFLICT
  ): void {
    res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send internal server error response
   */
  static internalError(
    res: Response,
    message: string = ERROR_MESSAGES.INTERNAL_ERROR
  ): void {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send created response
   */
  static created(
    res: Response,
    data: any,
    message: string = SUCCESS_MESSAGES.CREATED
  ): void {
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send no content response
   */
  static noContent(res: Response): void {
    res.status(HTTP_STATUS.NO_CONTENT).send();
  }

  /**
   * Send paginated response
   */
  static paginated(
    res: Response,
    data: any[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
    message: string = SUCCESS_MESSAGES.LIST_RETRIEVED
  ): void {
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data,
      pagination,
      message,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Enhanced Logger with Clean Code principles
 * Provides consistent logging across the application
 */
export class Logger {
  private static log(level: string, message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    switch (level) {
      case 'error':
        console.error(logMessage, ...args);
        break;
      case 'warn':
        console.warn(logMessage, ...args);
        break;
      case 'info':
        console.info(logMessage, ...args);
        break;
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(logMessage, ...args);
        }
        break;
      default:
        console.log(logMessage, ...args);
    }
  }

  static error(message: string, ...args: any[]): void {
    this.log('error', message, ...args);
  }

  static warn(message: string, ...args: any[]): void {
    this.log('warn', message, ...args);
  }

  static info(message: string, ...args: any[]): void {
    this.log('info', message, ...args);
  }

  static debug(message: string, ...args: any[]): void {
    this.log('debug', message, ...args);
  }
}

/**
 * Validation utilities with Clean Code principles
 */
export class ValidationUtils {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number (Colombian format)
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+57|57)?[1-9]\d{9}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate document number based on type
   */
  static isValidDocument(document: string, type: string): boolean {
    switch (type) {
      case 'cedula':
        return /^\d{7,11}$/.test(document);
      case 'pasaporte':
        return /^[A-Z0-9]{6,12}$/i.test(document);
      case 'nit':
        return /^\d{9}-\d$/.test(document);
      default:
        return false;
    }
  }

  /**
   * Validate product code format
   */
  static isValidProductCode(code: string): boolean {
    const codeRegex = /^[A-Z]{2,4}-[0-9]{3,6}$/;
    return codeRegex.test(code);
  }

  /**
   * Validate password strength
   */
  static isValidPassword(password: string): boolean {
    return password.length >= 6 && password.length <= 128;
  }

  /**
   * Validate numeric range
   */
  static isValidNumericRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  /**
   * Validate string length
   */
  static isValidStringLength(value: string, min: number, max: number): boolean {
    return value.length >= min && value.length <= max;
  }

  /**
   * Validate date format
   */
  static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * Validate date range
   */
  static isValidDateRange(startDate: string, endDate: string): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
  }
}

/**
 * String utilities with Clean Code principles
 */
export class StringUtils {
  /**
   * Capitalize first letter of string
   */
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Convert string to title case
   */
  static toTitleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  /**
   * Generate random string
   */
  static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate slug from string
   */
  static generateSlug(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Truncate string to specified length
   */
  static truncate(str: string, length: number, suffix: string = '...'): string {
    if (str.length <= length) {
      return str;
    }
    return str.substring(0, length - suffix.length) + suffix;
  }

  /**
   * Remove special characters from string
   */
  static removeSpecialChars(str: string): string {
    return str.replace(/[^a-zA-Z0-9\s]/g, '');
  }

  /**
   * Format currency
   */
  static formatCurrency(amount: number, currency: string = 'COP'): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Format number with thousands separator
   */
  static formatNumber(num: number): string {
    return new Intl.NumberFormat('es-CO').format(num);
  }
}

/**
 * Date utilities with Clean Code principles
 */
export class DateUtils {
  /**
   * Format date to ISO string
   */
  static toISOString(date: Date): string {
    return date.toISOString();
  }

  /**
   * Format date to readable string
   */
  static toReadableString(date: Date): string {
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Get start of day
   */
  static getStartOfDay(date: Date): Date {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  /**
   * Get end of day
   */
  static getEndOfDay(date: Date): Date {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  /**
   * Add days to date
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Add months to date
   */
  static addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  /**
   * Get difference in days between two dates
   */
  static getDaysDifference(date1: Date, date2: Date): number {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if date is today
   */
  static isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  /**
   * Check if date is in the past
   */
  static isPast(date: Date): boolean {
    return date < new Date();
  }

  /**
   * Check if date is in the future
   */
  static isFuture(date: Date): boolean {
    return date > new Date();
  }
}

/**
 * Array utilities with Clean Code principles
 */
export class ArrayUtils {
  /**
   * Remove duplicates from array
   */
  static removeDuplicates<T>(array: T[]): T[] {
    return [...new Set(array)];
  }

  /**
   * Group array by key
   */
  static groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  /**
   * Sort array by key
   */
  static sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    return array.sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Chunk array into smaller arrays
   */
  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Flatten nested array
   */
  static flatten<T>(array: T[][]): T[] {
    return array.reduce((flat, item) => flat.concat(item), []);
  }

  /**
   * Get unique values from array
   */
  static unique<T>(array: T[]): T[] {
    return Array.from(new Set(array));
  }

  /**
   * Shuffle array
   */
  static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

/**
 * Object utilities with Clean Code principles
 */
export class ObjectUtils {
  /**
   * Deep clone object
   */
  static deepClone<T>(obj: T): T {
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
   * Deep merge objects
   */
  static deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
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
   * Pick specific properties from object
   */
  static pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  }

  /**
   * Omit specific properties from object
   */
  static omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  }

  /**
   * Check if object is empty
   */
  static isEmpty(obj: any): boolean {
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
   * Get nested property value
   */
  static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Set nested property value
   */
  static setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }
}
