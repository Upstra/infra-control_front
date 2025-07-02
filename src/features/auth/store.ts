import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
  LoginDto,
  RegisterDto,
  TwoFADto,
  AuthResponse,
  TwoFAResponseDto,
  TwoFARecoveryDto,
} from './types';

import { extractAxiosMessage } from '@/shared/utils/http';
import { i18n } from '@/i18n';

import {
  generate2FAQr,
  get2FAStatus,
  login,
  register,
  verify2FA,
  verify2FARecovery,
  disable2FA,
} from './api';
import { getMe } from '../users/api';
import { NoAuthTokenError } from './exceptions';
import type { User } from '../users/types';
import { getToken, setToken, clearToken, onTokenChange } from './token';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getToken());
  const currentUser = ref<User | null>(null);

  onTokenChange((newToken) => {
    token.value = newToken;
  });

  const tempToken = ref<string | null>(null);
  const requiresTwoFactor = ref<boolean>(false);
  const isTwoFactorEnabled = ref<boolean | null>(null);
  const isAuthenticated = ref(false);
  const recoveryCodes = ref<string[]>([]);

  const loginUser = async (payload: LoginDto) => {
    try {
      resetAuthState();

      const response = await login(payload);

      const data: AuthResponse = response.data;

      if (data.requiresTwoFactor && data.twoFactorToken) {
        tempToken.value = data.twoFactorToken;
        requiresTwoFactor.value = true;
        localStorage.setItem('twoFactorToken', data.twoFactorToken);
      } else {
        token.value = data.accessToken;
        setToken(token.value);
        await fetchCurrentUser();
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      throw new Error(
        err.response?.data?.message ??
          err.message ??
          i18n.global.t('errors.connection'),
      );
    }
  };

  const registerUser = async (payload: RegisterDto) => {
    resetAuthState();

    const response = await register(payload);
    const data: AuthResponse = response.data;

    token.value = data.accessToken;
    setToken(token.value);
    isAuthenticated.value = true;
    fetchCurrentUser();
  };

  const fetchCurrentUser = async () => {
    if (!token.value) throw new Error('No auth token');
    const data = await getMe(token.value);
    // Les rôles sont maintenant inclus dans la réponse de l'API
    currentUser.value = data;
    return data;
  };

  const verify2FACommon = async (
    payload: TwoFADto | TwoFARecoveryDto,
    verifyFn: (dto: any, token: string) => Promise<{ data: TwoFAResponseDto }>,
  ) => {
    const storedToken =
      tempToken.value ?? localStorage.getItem('twoFactorToken') ?? getToken();
    if (!storedToken) throw new NoAuthTokenError('No auth token');

    try {
      const response = await verifyFn(payload, storedToken);
      const data = response.data;

      if (!data.isValid || !data.accessToken) {
        throw new Error(data.message ?? 'Code 2FA invalide');
      }

      token.value = data.accessToken;
      recoveryCodes.value = data.recoveryCodes ?? [];
      setToken(token.value);
      requiresTwoFactor.value = false;
      tempToken.value = null;
      localStorage.removeItem('twoFactorToken');

      recoveryCodes.value = Array.isArray(data.recoveryCodes)
        ? data.recoveryCodes
        : [];
    } catch (err: any) {
      throw new Error(extractAxiosMessage(err));
    }
  };

  const verifyTwoFA = async (dto: TwoFADto) => {
    return verify2FACommon(dto, verify2FA);
  };

  const verifyTwoFARecovery = async (dto: TwoFARecoveryDto) => {
    return verify2FACommon(dto, verify2FARecovery);
  };

  const qrData = ref<{ setupKey: string; qrCode: string } | null>(null);

  const generateQrCode = async () => {
    const token = getToken();
    if (!token) throw new Error('No auth token');

    try {
      const data = await generate2FAQr(token);
      qrData.value = data;
      return true;
    } catch (err: any) {
      const message = extractAxiosMessage(err);

      if (err.response?.status === 403 && message.includes('déjà activé')) {
        qrData.value = null;
        return false;
      }

      throw new Error(message);
    }
  };

  const fetchTwoFAStatus = async () => {
    const token = getToken();
    if (!token) throw new Error('No auth token');
    try {
      const { isTwoFactorEnabled: enabled } = await get2FAStatus(token);
      isTwoFactorEnabled.value = enabled;
    } catch (err: any) {
      const message = extractAxiosMessage(err);
      if (err.response?.status === 403 && message.includes('non activé')) {
        isTwoFactorEnabled.value = false;
        return;
      }

      throw new Error(message);
    }
  };

  const disable2FAUser = async (): Promise<boolean> => {
    const token = getToken();
    if (!token) throw new Error('No auth token');
    try {
      const { isDisabled } = await disable2FA(token);
      if (isDisabled) {
        isTwoFactorEnabled.value = false;
        recoveryCodes.value = [];
        qrData.value = null;
        return true;
      }
    } catch (err: any) {
      const message = extractAxiosMessage(err);
      if (err.response?.status === 403 && message.includes('not enabled')) {
        isTwoFactorEnabled.value = false;
        return false;
      }
      throw new Error(message);
    }

    return false;
  };

  const checkTokenValidity = async () => {
    const storedToken = getToken();
    if (!storedToken) {
      token.value = null;
      isAuthenticated.value = false;
      return false;
    }

    try {
      await getMe(storedToken);
      isAuthenticated.value = true;
      return true;
    } catch {
      clearToken();
      localStorage.removeItem('twoFactorToken');
      token.value = null;
      tempToken.value = null;
      requiresTwoFactor.value = false;
      isTwoFactorEnabled.value = null;
      isAuthenticated.value = false;
      return false;
    }
  };

  const resetAuthState = () => {
    token.value = null;
    tempToken.value = null;
    requiresTwoFactor.value = false;
    recoveryCodes.value = [];
    isTwoFactorEnabled.value = null;
    isAuthenticated.value = false;
    currentUser.value = null;

    qrData.value = null;
    clearToken();
    localStorage.removeItem('twoFactorToken');
  };

  return {
    token,
    currentUser,
    fetchCurrentUser,
    resetAuthState,
    disable2FAUser,
    generateQrCode,
    fetchTwoFAStatus,
    isTwoFactorEnabled,
    checkTokenValidity,
    isAuthenticated,
    qrData,
    tempToken,
    requiresTwoFactor,
    loginUser,
    registerUser,
    verifyTwoFA,
    verifyTwoFARecovery,
    recoveryCodes,
  };
});
