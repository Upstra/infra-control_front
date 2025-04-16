import axios from '@/services/api'
import type { AuthResponse, LoginDto, RegisterDto } from '../types'

export const login = (Dto: LoginDto) => axios.post<AuthResponse>('/auth/login', Dto)

export const register = (Dto: RegisterDto) => axios.post<AuthResponse>('/auth/register', Dto)
