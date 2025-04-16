export interface TwoFADto {
    code: string;
}

export interface TwoFAResponseDto {
    isValid: boolean;
    accessToken: string | null;
    message?: string;
}


export interface TwoFADisableResponseDto {
    isDisabled: boolean;
    message: string;
}

export interface TwoFAGenerateResponse {
    setupKey: string
    qrCode: string
}