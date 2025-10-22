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
}
