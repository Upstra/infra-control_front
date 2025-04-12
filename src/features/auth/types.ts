export interface LoginDto {
    username: string;
    password: string;
}

export interface RegisterDto {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
}

export interface TwoFADto {
    code: string;
}

export interface TwoFAResponseDto {
    isValid: boolean;
    accessToken: string;
}

export interface TwoFADisableResponseDto {
    isDisabled: boolean;
    message: string;
}

export interface AuthResponse {
    accessToken: string;
    requiresTwoFactor?: boolean;
    twoFactorToken?: string;
}