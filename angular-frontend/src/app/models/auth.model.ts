export interface User {
  _id?: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  role?: string;
  profilePicture?: string;
  emailVerified?: boolean;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  birthDate?: Date;
  avatarId?: number; // Para selección de avatares predefinidos
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  firstName: string;
  lastName: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  avatarId?: number;
  termsAccepted: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresAt?: number;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}