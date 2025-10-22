// DTO interfaces for all entities

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

// Authentication DTOs
export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  nombre: string;
  email: string;
  password: string;
  rol?: 'admin' | 'vendedor';
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

// Authentication response interfaces
export interface AuthResponse {
  user: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
    activo: boolean;
  };
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface ProfileResponse {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
}

// Usuario DTOs
export interface UsuarioDTO extends BaseDTO {
  nombre: string;
  email: string;
  rol: 'admin' | 'vendedor';
  activo: boolean;
}

export interface UsuarioCreateDTO {
  nombre: string;
  email: string;
  password: string;
  rol?: 'admin' | 'vendedor';
  activo?: boolean;
}

export interface UsuarioUpdateDTO {
  nombre?: string;
  email?: string;
  password?: string;
  rol?: 'admin' | 'vendedor';
  activo?: boolean;
}

export interface UsuarioFiltersDTO {
  rol?: 'admin' | 'vendedor';
  activo?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Producto DTOs
export interface ProductoDTO extends BaseDTO {
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria: string;
  activo: boolean;
}

export interface ProductoCreateDTO {
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  categoria: string;
  activo?: boolean;
}

export interface ProductoUpdateDTO {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  precio?: number;
  stock?: number;
  categoria?: string;
  activo?: boolean;
}

export interface ProductoFiltersDTO {
  categoria?: string;
  activo?: boolean;
  search?: string;
  minPrecio?: number;
  maxPrecio?: number;
  page?: number;
  limit?: number;
}

export interface StockUpdateDTO {
  cantidad: number;
  operacion: 'add' | 'subtract' | 'set';
}

// Cliente DTOs
export interface ClienteDTO extends BaseDTO {
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  documento: string;
  tipoDocumento: 'cedula' | 'pasaporte' | 'nit';
  activo: boolean;
}

export interface ClienteCreateDTO {
  nombre: string;
  email: string;
  telefono?: string;
  direccion?: string;
  documento: string;
  tipoDocumento?: 'cedula' | 'pasaporte' | 'nit';
  activo?: boolean;
}

export interface ClienteUpdateDTO {
  nombre?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  documento?: string;
  tipoDocumento?: 'cedula' | 'pasaporte' | 'nit';
  activo?: boolean;
}

export interface ClienteFiltersDTO {
  tipoDocumento?: 'cedula' | 'pasaporte' | 'nit';
  activo?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Order DTOs (for future use)
export interface PedidoDTO extends BaseDTO {
  clienteId: number;
  usuarioId: number;
  fecha: Date;
  total: number;
  estado: 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado';
}

export interface PedidoCreateDTO {
  clienteId: number;
  productos: PedidoProductoDTO[];
}

export interface PedidoProductoDTO {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

export interface PedidoUpdateDTO {
  estado?: 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado';
}

export interface PedidoFiltersDTO {
  clienteId?: number;
  productoId?: number;
  estado?: 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado';
  fechaInicio?: Date;
  fechaFin?: Date;
  page?: number;
  limit?: number;
}

// Statistics DTOs
export interface UsuarioStatisticsDTO {
  total: number;
  active: number;
  inactive: number;
  admins: number;
  vendedores: number;
}

export interface ProductoStatisticsDTO {
  total: number;
  active: number;
  inactive: number;
  lowStock: number;
  categories: { [key: string]: number };
  totalValue: number;
}

export interface ClienteStatisticsDTO {
  total: number;
  active: number;
  inactive: number;
  cedulas: number;
  pasaportes: number;
  nits: number;
  documentTypes: { [key: string]: number };
}

// Encryption DTOs
export interface EncryptionRequestDTO {
  data: any;
  publicKey: string;
}

export interface EncryptionResponseDTO {
  encryptedData: string;
  encryptedKey: string;
  iv: string;
  algorithm: string;
}

export interface DecryptionRequestDTO {
  encryptedData: string;
  encryptedKey: string;
  iv: string;
  privateKey: string;
}

export interface DecryptionResponseDTO {
  decryptedData: any;
  algorithm: string;
}

export interface HashRequestDTO {
  data: string;
}

export interface HashResponseDTO {
  hash: string;
  algorithm: string;
  originalLength: number;
}

export interface RandomStringRequestDTO {
  length?: number;
}

export interface RandomStringResponseDTO {
  randomString: string;
  length: number;
  algorithm: string;
}

// Error DTOs
export interface ValidationErrorDTO {
  field: string;
  message: string;
  value?: any;
}

export interface ErrorResponseDTO {
  success: false;
  message: string;
  error?: any;
  errors?: ValidationErrorDTO[];
}

// Search DTOs
export interface SearchRequestDTO {
  q: string;
  page?: number;
  limit?: number;
}

export interface SearchResponseDTO<T> {
  results: T[];
  total: number;
  searchTerm: string;
  page?: number;
  limit?: number;
}

// Export all DTOs
export * from './validationSchemas';
