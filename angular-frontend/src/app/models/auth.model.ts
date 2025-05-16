export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  isAdmin?: boolean;
  profilePicture?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  termsAccepted: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn?: number;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}