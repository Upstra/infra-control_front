import axios from '@/services/api';
import { type AuthResponse, type LoginDto, type RegisterDto, type TwoFADto } from './types';

export const login = (Dto: LoginDto) =>
    axios.post<AuthResponse>('/auth/login', Dto);


export const register = (Dto: RegisterDto) =>
    axios.post<AuthResponse>('/auth/register', Dto);

export const verify2FA = (Dto: TwoFADto, token: string) =>
    axios.post<AuthResponse>(
        '/auth/2fa/verify',
        Dto,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

