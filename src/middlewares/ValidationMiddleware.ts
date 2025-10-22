import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ResponseHelper } from '../utils/helpers';

export class ValidationMiddleware {
  /**
   * Validate request body against Joi schema
   */
  public static validateBody(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const { error } = schema.validate(req.body);
      
      if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        ResponseHelper.validationError(res, errorMessage, error.details);
        return;
      }
      
      next();
    };
  }

  /**
   * Validate request query parameters against Joi schema
   */
  public static validateQuery(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const { error } = schema.validate(req.query);
      
      if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        ResponseHelper.validationError(res, errorMessage, error.details);
        return;
      }
      
      next();
    };
  }

  /**
   * Validate request parameters against Joi schema
   */
  public static validateParams(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const { error } = schema.validate(req.params);
      
      if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        ResponseHelper.validationError(res, errorMessage, error.details);
        return;
      }
      
      next();
    };
  }

  /**
   * Validate request headers against Joi schema
   */
  public static validateHeaders(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const { error } = schema.validate(req.headers);
      
      if (error) {
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        ResponseHelper.validationError(res, errorMessage, error.details);
        return;
      }
      
      next();
    };
  }

  /**
   * Validate pagination parameters
   */
  public static validatePagination = (req: Request, res: Response, next: NextFunction): void => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (page < 1) {
      ResponseHelper.validationError(res, 'Page must be greater than 0');
      return;
    }
    
    if (limit < 1 || limit > 100) {
      ResponseHelper.validationError(res, 'Limit must be between 1 and 100');
      return;
    }
    
    // Add validated pagination to request
    req.query.page = page.toString();
    req.query.limit = limit.toString();
    req.query.offset = ((page - 1) * limit).toString();
    
    next();
  };

  /**
   * Validate email format
   */
  public static validateEmail = (req: Request, res: Response, next: NextFunction): void => {
    const email = req.body.email || req.query.email;
    
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        ResponseHelper.validationError(res, 'Invalid email format');
        return;
      }
    }
    
    next();
  };

  /**
   * Validate password strength
   */
  public static validatePassword = (req: Request, res: Response, next: NextFunction): void => {
    const password = req.body.password;
    
    if (password) {
      if (password.length < 6) {
        ResponseHelper.validationError(res, 'Password must be at least 6 characters long');
        return;
      }
      
      if (password.length > 128) {
        ResponseHelper.validationError(res, 'Password must be less than 128 characters');
        return;
      }
    }
    
    next();
  };

  /**
   * Validate ID parameter
   */
  public static validateId = (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params.id;
    
    if (id) {
      const numericId = parseInt(id);
      if (isNaN(numericId) || numericId < 1) {
        ResponseHelper.validationError(res, 'Invalid ID parameter');
        return;
      }
    }
    
    next();
  };

  /**
   * Validate Colombian phone number
   */
  public static validateColombianPhone = (req: Request, res: Response, next: NextFunction): void => {
    const telefono = req.body.telefono;
    
    if (telefono) {
      const phoneRegex = /^(\+57|57)?[1-9]\d{9}$/;
      const cleanPhone = telefono.replace(/\s/g, '');
      
      if (!phoneRegex.test(cleanPhone)) {
        ResponseHelper.validationError(res, 'Invalid Colombian phone number format');
        return;
      }
    }
    
    next();
  };

  /**
   * Validate Colombian document
   */
  public static validateColombianDocument = (req: Request, res: Response, next: NextFunction): void => {
    const { documento, tipoDocumento } = req.body;
    
    if (documento && tipoDocumento) {
      let isValid = false;
      
      switch (tipoDocumento) {
        case 'cedula':
          const cedulaRegex = /^[1-9]\d{6,10}$/;
          isValid = cedulaRegex.test(documento);
          break;
        case 'pasaporte':
          const pasaporteRegex = /^[A-Z0-9]{6,12}$/;
          isValid = pasaporteRegex.test(documento);
          break;
        case 'nit':
          const nitRegex = /^[0-9]{9}-[0-9]$/;
          isValid = nitRegex.test(documento);
          break;
      }
      
      if (!isValid) {
        ResponseHelper.validationError(res, `Invalid ${tipoDocumento} format`);
        return;
      }
    }
    
    next();
  };

  /**
   * Validate product code format
   */
  public static validateProductCode = (req: Request, res: Response, next: NextFunction): void => {
    const codigo = req.body.codigo;
    
    if (codigo) {
      const codeRegex = /^[A-Z]{2,4}-[0-9]{3,6}$/;
      
      if (!codeRegex.test(codigo)) {
        ResponseHelper.validationError(res, 'Product code must follow format: ABC-123 (2-4 letters, hyphen, 3-6 digits)');
        return;
      }
    }
    
    next();
  };

  /**
   * Validate price format
   */
  public static validatePrice = (req: Request, res: Response, next: NextFunction): void => {
    const precio = req.body.precio;
    
    if (precio !== undefined) {
      if (typeof precio !== 'number' || precio <= 0 || precio > 999999.99) {
        ResponseHelper.validationError(res, 'Price must be a number between 0.01 and 999999.99');
        return;
      }
    }
    
    next();
  };

  /**
   * Validate stock quantity
   */
  public static validateStock = (req: Request, res: Response, next: NextFunction): void => {
    const stock = req.body.stock;
    
    if (stock !== undefined) {
      if (!Number.isInteger(stock) || stock < 0 || stock > 999999) {
        ResponseHelper.validationError(res, 'Stock must be an integer between 0 and 999999');
        return;
      }
    }
    
    next();
  };

  /**
   * Validate date range
   */
  public static validateDateRange = (req: Request, res: Response, next: NextFunction): void => {
    const { fechaInicio, fechaFin } = req.query;
    
    if (fechaInicio && fechaFin) {
      const startDate = new Date(fechaInicio as string);
      const endDate = new Date(fechaFin as string);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        ResponseHelper.validationError(res, 'Invalid date format');
        return;
      }
      
      if (startDate > endDate) {
        ResponseHelper.validationError(res, 'Start date must be before end date');
        return;
      }
    }
    
    next();
  };

  /**
   * Validate search term
   */
  public static validateSearchTerm = (req: Request, res: Response, next: NextFunction): void => {
    const searchTerm = req.query.q || req.query.search;
    
    if (searchTerm) {
      if (typeof searchTerm !== 'string' || searchTerm.trim().length < 2) {
        ResponseHelper.validationError(res, 'Search term must be at least 2 characters long');
        return;
      }
      
      if (searchTerm.length > 100) {
        ResponseHelper.validationError(res, 'Search term must be less than 100 characters');
        return;
      }
    }
    
    next();
  };

  /**
   * Sanitize input data
   */
  public static sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
    const sanitize = (obj: any): any => {
      if (typeof obj === 'string') {
        // Remove potentially dangerous characters
        return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                  .replace(/javascript:/gi, '')
                  .replace(/on\w+\s*=/gi, '')
                  .trim();
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