import axios from '@/services/api';
import type { AuthResponse, LoginDto, RegisterDto } from '../types';

export const login = (Dto: LoginDto) =>
  axios.post<AuthResponse>('/auth/login', Dto);

export const register = (Dto: RegisterDto) =>
  axios.post<AuthResponse>('/auth/register', Dto);

export const refreshAccessToken = () =>
  axios.post<AuthResponse>('/auth/refresh', {}, { withCredentials: true });

export const logout = () => axios.post('/auth/logout');

export const forgotPassword = (email: string) =>
  axios.post<void>('/auth/forgot-password', { email });

export const resetPasswordWithToken = (token: string, newPassword: string) =>
  axios.post<AuthResponse>('/auth/reset-password', { token, newPassword });
