import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  LoginDto,
  RegisterDto,
  TwoFADto,
  AuthResponse,
  TwoFAResponseDto,
} from "./types";

import { extractAxiosMessage } from "@/shared/utils/http";

import { generate2FAQr, get2FAStatus, login, register, verify2FA } from "./api";
import { getMe } from "../users/api";
import { NoAuthTokenError } from "./exceptions";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(localStorage.getItem("token"));
  const tempToken = ref<string | null>(null);
  const requiresTwoFactor = ref<boolean>(false);
  const isTwoFactorEnabled = ref<boolean | null>(null);
  const isAuthenticated = ref(false);
  const recoveryCodes = ref<string[]>([]);

  const loginUser = async (payload: LoginDto) => {
    try {
      const response = await login(payload);

      const data: AuthResponse = response.data;

      if (data.requiresTwoFactor && data.twoFactorToken) {
        tempToken.value = data.twoFactorToken;
        requiresTwoFactor.value = true;
        localStorage.setItem("twoFactorToken", data.twoFactorToken);
      } else {
        console.log("Login successful:", data);
        token.value = data.accessToken;
        localStorage.setItem("token", token.value);
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      throw new Error(
        err.response?.data?.message ?? err.message ?? "Erreur de connexion"
      );
    }
  };

  const registerUser = async (payload: RegisterDto) => {
    const response = await register(payload);
    const data: AuthResponse = response.data;

    token.value = data.accessToken;
    localStorage.setItem("token", token.value);
  };

  const verifyTwoFA = async (payload: TwoFADto) => {
    const storedToken =
      tempToken.value ??
      localStorage.getItem("twoFactorToken") ??
      localStorage.getItem("token");
    if (!storedToken) throw new NoAuthTokenError("No auth token");

    try {
      const response = await verify2FA(payload, storedToken);
      console.log("verify2FA response:", response);
      const data: TwoFAResponseDto = response.data;

      if (!data.isValid || !data.accessToken) {
        console.warn("verify2FA: code valide mais accessToken manquant");
        throw new Error(data.message ?? "Code 2FA invalide");
      }

      token.value = data.accessToken;
      localStorage.setItem("token", token.value);
      requiresTwoFactor.value = false;
      tempToken.value = null;
      localStorage.removeItem("twoFactorToken");

      if (data.recoveryCodes && Array.isArray(data.recoveryCodes)) {
        recoveryCodes.value = data.recoveryCodes;
      } else {
        recoveryCodes.value = [];
      }
    } catch (err: any) {
      throw new Error(extractAxiosMessage(err));
    }
  };

  const qrData = ref<{ setupKey: string; qrCode: string } | null>(null);

  const generateQrCode = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No auth token");

    try {
      const data = await generate2FAQr(token);
      qrData.value = data;
      return true;
    } catch (err: any) {
      const message = extractAxiosMessage(err);

      if (err.response?.status === 403 && message.includes("déjà activé")) {
        qrData.value = null;
        return false;
      }

      throw new Error(message);
    }
  };

  const fetchTwoFAStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No auth token");
    try {
      const { isTwoFactorEnabled: enabled } = await get2FAStatus(token);
      isTwoFactorEnabled.value = enabled;
    } catch (err: any) {
      const message = extractAxiosMessage(err);
      if (err.response?.status === 403 && message.includes("non activé")) {
        isTwoFactorEnabled.value = false;
        return;
      }

      throw new Error(message);
    }
  };

  const checkTokenValidity = async () => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      token.value = null;
      isAuthenticated.value = false;
      return false;
    }

    try {
      await getMe(storedToken);
      isAuthenticated.value = true;
      return true;
    } catch (err: any) {
      localStorage.removeItem("token");
      localStorage.removeItem("twoFactorToken");
      token.value = null;
      tempToken.value = null;
      requiresTwoFactor.value = false;
      isTwoFactorEnabled.value = null;
      isAuthenticated.value = false;
      return false;
    }
  };

  return {
    token,
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
    recoveryCodes,
  };
});
