// Utility functions
export class Logger {
  static info(message: string, data?: any): void {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || '');
  }

  static error(message: string, error?: any): void {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
  }

  static warn(message: string, data?: any): void {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '');
  }

  static debug(message: string, data?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, data || '');
    }
  }
}

// Response helper
export class ResponseHelper {
  static success<T>(res: any, data: T, message?: string, statusCode: number = 200): void {
    res.status(statusCode).json({
      success: true,
      data,
      message
    });
  }

  static error(res: any, message: string, statusCode: number = 500, error?: any): void {
    res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }

  static validationError(res: any, message: string, errors?: any): void {
    res.status(400).json({
      success: false,
      message,
      errors
    });
  }
}
