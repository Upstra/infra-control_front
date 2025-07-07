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
 * PATCH /user/:id/delete-account (endpoint admin)
 * soft Delete a user account by ID
 *
 * @param id UUID of the user to delete
 * @param token JWT of the admin
 */
export const deleteUser = async (
  id: string,
  token: string,
  data?: { reason?: string; details?: string },
): Promise<void> => {
  await axios.patch(`/user/${id}/delete-account`, data || {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
/**
 * DELETE /user/me/delete-account (endpoint user)
 * Delete the current user's account
 * @param token JWT of the current user
 */
export const deleteCurrentUser = async (token: string): Promise<void> => {
  await axios.delete('/user/me/delete-account', {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * PATCH /user/:id/toggle-status (endpoint admin)
 * Toggle user active status
 *
 * @param id UUID of the user to toggle
 * @param token JWT of the admin
 */
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

/**
 * PATCH /user/bulk-activate (endpoint admin)
 * Activate multiple users at once
 *
 * @param userIds Array of user IDs to activate
 * @param token JWT of the admin
 */
export const bulkActivateUsers = async (
  userIds: string[],
  token: string,
): Promise<UserResponseDto[]> => {
  const { data } = await axios.patch<UserResponseDto[]>(
    `/user/bulk-activate`,
    { userIds },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return data;
};
