export interface User {
  _id?: string;
  username: string;
  email: string;
  password?: string;
  role?: string;
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
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
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