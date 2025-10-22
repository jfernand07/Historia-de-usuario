import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/helpers';

export class ErrorMiddleware {
  /**
   * Global error handler middleware
   */
  public static errorHandler = (error: any, req: Request, res: Response, next: NextFunction): void => {
    Logger.error('Unhandled error:', error);

    // Default error response
    let statusCode = 500;
    let message = 'Internal server error';
    let details = undefined;

    // Handle specific error types
    if (error.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation error';
      details = error.details;
    } else if (error.name === 'SequelizeValidationError') {
      statusCode = 400;
      message = 'Database validation error';
      details = error.errors?.map((err: any) => ({
        field: err.path,
        message: err.message
      }));
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      statusCode = 409;
      message = 'Resource already exists';
    } else if (error.name === 'SequelizeForeignKeyConstraintError') {
      statusCode = 400;
      message = 'Invalid reference to related resource';
    } else if (error.name === 'SequelizeDatabaseError') {
      statusCode = 500;
      message = 'Database error';
    } else if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
    } else if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token has expired';
    } else if (error.name === 'NotBeforeError') {
      statusCode = 401;
      message = 'Token not active';
    } else if (error.statusCode) {
      statusCode = error.statusCode;
      message = error.message;
    } else if (error.message) {
      message = error.message;
    }

    // Don't expose internal errors in production
    if (process.env.NODE_ENV === 'production' && statusCode === 500) {
      message = 'Internal server error';
      details = undefined;
    }

    res.status(statusCode).json({
      success: false,
      message,
      error: details,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  };

  /**
   * Handle 404 errors
   */
  public static notFound = (req: Request, res: Response, next: NextFunction): void => {
    res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.path} not found`
    });
  };

  /**
   * Handle async errors
   */
  public static asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  };
}
