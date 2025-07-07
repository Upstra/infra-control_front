import axios from '@/services/api';
import type {
  UserResponseDto,
  UserUpdateDto,
  UserCreateDto,
  UserListResponseDto,
} from './types';

export const fetchUsers = async (
  token: string,
  page = 1,
  limit = 10,
): Promise<UserListResponseDto> => {
  const { data } = await axios.get<UserListResponseDto>('/user', {
    params: { page, limit },
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const createUser = async (
  payload: UserCreateDto,
  token: string,
): Promise<UserResponseDto> => {
  const { data } = await axios.post<UserResponseDto>('/users', payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const getMe = async (token: string): Promise<UserResponseDto> => {
  const response = await axios.get('/user/me', {
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
  token: string,
): Promise<UserResponseDto> => {
  const { data } = await axios.patch<UserResponseDto>(
    '/user/me/reset-password',
    { newPassword },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
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
  token: string,
): Promise<UserResponseDto> => {
  const { data } = await axios.patch<UserResponseDto>(
    `/user/${id}/reset-password`,
    { newPassword },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return data;
};

/** PATCH /user/me/update-account
 * Met à jour les informations de l'utilisateur courant
 *
 * @param payload Informations à mettre à jour
 * @param token JWT de l'utilisateur
 */
export const updateCurrentUser = async (
  payload: UserUpdateDto,
  token: string,
): Promise<UserResponseDto> => {
  const { data } = await axios.patch<UserResponseDto>(
    '/user/me/update-account',
    payload,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return data;
};

/**
 * PATCH /user/:id/update-account  (endpoint admin)
 * Met à jour les informations d'un utilisateur via son UUID
 *
 * @param id UUID de l'utilisateur à mettre à jour
 * @param payload Informations à mettre à jour
 * @param token JWT de l'admin
 */
export const updateUser = async (
  id: string,
  payload: any,
  token: string,
): Promise<UserResponseDto> => {
  const { data } = await axios.patch<UserResponseDto>(
    `/user/${id}/update-account`,
    payload,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return data;
};

/**
 * PATCH /user/:id/delete-account  (endpoint admin)
 * Supprime un utilisateur via son UUID. Action Irréversible
 *
 * @param id UUID de l'utilisateur à supprimer
 * @param token JWT de l'admin
 */
export const deleteUser = async (id: string, token: string): Promise<void> => {
  await axios.patch(`/user/${id}/delete-account`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/*
 * DELETE /user/me/delete-account
 * Supprime l'utilisateur courant
 * Supprime l'utilisateur courant via son token JWT. Action Irréversible
 *
 * @param token JWT de l'utilisateur
 */
export const deleteCurrentUser = async (token: string): Promise<void> => {
  await axios.delete('/user/me/delete-account', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const toggleUserStatus = async (
  id: string,
  token: string,
): Promise<UserResponseDto> => {
  const { data } = await axios.patch<UserResponseDto>(
    `/user/${id}/toggle-status`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return data;
};
