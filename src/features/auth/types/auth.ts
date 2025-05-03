export interface LoginDto {
  identifier: string;
  password: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  requiresTwoFactor?: boolean;
  twoFactorToken?: string;
}
