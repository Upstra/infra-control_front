export interface TwoFADto {
  code: string;
}

export interface TwoFAResponseDto {
  isValid: boolean;
  accessToken: string | null;
  message?: string;
  recoveryCodes?: string[];
}

export interface TwoFADisableResponseDto {
  isDisabled: boolean;
  message: string;
}

export interface TwoFAGenerateResponse {
  setupKey: string;
  qrCode: string;
}

export interface TwoFARecoveryDto {
  recoveryCode: string;
}
