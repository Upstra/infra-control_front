import axios from "@/services/api";
import type { UserResponseDto } from "./types";

export const fetchUsers = () => {
  console.log("Hello from users API");
  return axios.get("/users");
};

export const createUsers = (payload: any) => {
  console.log("Creating new users");
  return axios.post("/users", payload);
};

export const getMe = async (token: string): Promise<UserResponseDto> => {
  const response = await axios.get("/user/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

/**
 * PATCH /user/me/reset-password
 * Réinitialise le mot de passe de l’utilisateur courant.
 *
 * @param newPassword  Le nouveau mot de passe
 * @param token        Le JWT (récupéré depuis le store ou localStorage)
 */
export const resetCurrentUserPassword = async (
  newPassword: string,
  token: string
): Promise<UserResponseDto> => {
  const { data } = await axios.patch<UserResponseDto>(
    "/user/me/reset-password",
    { newPassword },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
};

/**
 * PATCH /user/:id/reset-password  (endpoint admin)
 * Permet à un administrateur de réinitialiser le mot de passe
 * d’un utilisateur spécifique.
 *
 * @param id          UUID de l’utilisateur cible
 * @param newPassword Nouveau mot de passe
 * @param token       JWT de l’admin
 */
export const resetUserPassword = async (
  id: string,
  newPassword: string,
  token: string
): Promise<UserResponseDto> => {
  const { data } = await axios.patch<UserResponseDto>(
    `/user/${id}/reset-password`,
    { newPassword },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
};
