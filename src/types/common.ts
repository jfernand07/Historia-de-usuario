// Base DTO interface
export interface BaseDTO {
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Common response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Pagination interface
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

// Paginated response interface
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
