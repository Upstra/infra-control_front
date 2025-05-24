import axios from "@/services/api";
import type {
  TwoFADto,
  TwoFAGenerateResponse,
  TwoFAResponseDto,
  TwoFARecoveryDto,
} from "../types";

export const verify2FA = (Dto: TwoFADto, token: string) =>
  axios.post<TwoFAResponseDto>("/auth/2fa/verify", Dto, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const generate2FAQr = async (
  token: string
): Promise<TwoFAGenerateResponse> => {
  const response = await axios.post(
    "/auth/2fa/generate",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const get2FAStatus = async (token: string) => {
  const response = await axios.get("/auth/2fa/status", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const verify2FARecovery = (dto: TwoFARecoveryDto, token: string) =>
  axios.post<TwoFAResponseDto>("/auth/2fa/recovery", dto, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const disable2FA = async (token: string) => {
  const response = await axios.post(
    "/auth/2fa/disable",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};
