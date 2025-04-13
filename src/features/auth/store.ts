import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
    LoginDto,
    RegisterDto,
    TwoFADto,
    AuthResponse,
    TwoFAResponseDto,
} from './types';
import { login, register, verify2FA } from './auth';
import { extractAxiosMessage } from '@/shared/utils/http';

export const useAuthStore = defineStore('auth', () => {
    const token = ref<string | null>(localStorage.getItem('token'));
    const tempToken = ref<string | null>(null);
    const requiresTwoFactor = ref<boolean>(false);

    const loginUser = async (payload: LoginDto) => {
        try {
            const response = await login(payload);


            const data: AuthResponse = response.data;

            if (data.requiresTwoFactor && data.twoFactorToken) {
                tempToken.value = data.twoFactorToken;
                requiresTwoFactor.value = true;
                localStorage.setItem('twoFactorToken', data.twoFactorToken);
            } else {
                token.value = data.accessToken;
                localStorage.setItem('token', token.value);
            }
        } catch (err: any) {
            console.error('Login failed:', err);
            throw new Error(err.response?.data?.message ?? err.message ?? 'Erreur de connexion');
        }
    };

    const registerUser = async (payload: RegisterDto) => {
        const response = await register(payload);
        const data: AuthResponse = response.data;

        token.value = data.accessToken;
        localStorage.setItem('token', token.value);
    };

    const verifyTwoFA = async (payload: TwoFADto) => {
        const storedToken = tempToken.value ?? localStorage.getItem('twoFactorToken');
        if (!storedToken) throw new Error('Missing temp token');

        try {
            const response = await verify2FA(payload, storedToken);
            const data: TwoFAResponseDto = response.data;

            if (!data.isValid || !data.accessToken) {
                console.warn('verify2FA: code valide mais accessToken manquant');
                throw new Error(data.message ?? 'Code 2FA invalide');
            }

            token.value = data.accessToken;
            localStorage.setItem('token', token.value);
            requiresTwoFactor.value = false;
            tempToken.value = null;
            localStorage.removeItem('twoFactorToken');
        } catch (err: any) {
            throw new Error(extractAxiosMessage(err));
        }
    };


    return {
        token,
        requiresTwoFactor,
        loginUser,
        registerUser,
        verifyTwoFA,
    };
});
