// Base middleware interface
export interface Middleware {
  (req: any, res: any, next: any): void | Promise<void>;
}

// Authentication middleware interface
export interface AuthMiddleware extends Middleware {
  // Additional auth-specific methods can be added here
}

// Validation middleware interface
export interface ValidationMiddleware extends Middleware {
  // Additional validation-specific methods can be added here
}
