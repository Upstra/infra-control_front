import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
    LoginDto,
    RegisterDto,
    TwoFADto,
    AuthResponse,
} from './types';
import { login, register, verify2FA } from './auth';

export const useAuthStore = defineStore('auth', () => {
    const token = ref<string | null>(localStorage.getItem('token'));
    const tempToken = ref<string | null>(null);
    const requiresTwoFactor = ref<boolean>(false);

    const loginUser = async (payload: LoginDto) => {
        try {
            const response = await login(payload); // 💥 va throw si erreur HTTP


            const data: AuthResponse = response.data;

            if (data.requiresTwoFactor && data.twoFactorToken) {
                tempToken.value = data.twoFactorToken;
                requiresTwoFactor.value = true;
            } else {
                token.value = data.accessToken;
                localStorage.setItem('token', token.value);
            }
        } catch (err: any) {
            console.error('Login failed:', err);
            throw new Error(err.response?.data?.message || err.message || 'Erreur de connexion');
        }
    };

    const registerUser = async (payload: RegisterDto) => {
        const response = await register(payload);
        const data: AuthResponse = response.data;

        token.value = data.accessToken;
        localStorage.setItem('token', token.value);
    };

    const verifyTwoFA = async (payload: TwoFADto) => {
        if (!tempToken.value) throw new Error('Missing temp token');
        const response = await verify2FA(payload, tempToken.value);
        const data: AuthResponse = response.data;

        token.value = data.accessToken;
        localStorage.setItem('token', token.value);
        requiresTwoFactor.value = false;
        tempToken.value = null;
    };

    return {
        token,
        requiresTwoFactor,
        loginUser,
        registerUser,
        verifyTwoFA,
    };
});
