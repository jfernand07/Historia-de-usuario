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
