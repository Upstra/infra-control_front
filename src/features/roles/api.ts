import api from '@/services/api';
import { i18n } from '@/i18n';
import type {
  RoleCreationDto,
  RoleResponseDto,
  RoleListResponseDto,
  RoleError,
  User,
} from './types';

class RoleApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>,
  ) {
    super(message);
    this.name = 'RoleApiError';
  }
}

const handleApiError = (error: any): never => {
  if (error.response?.data) {
    const errorData = error.response.data as RoleError;
    throw new RoleApiError(
      errorData.code || 'API_ERROR',
      errorData.message || i18n.global.t('roles.errors.generic'),
      errorData.details,
    );
  }
  throw new RoleApiError(
    'NETWORK_ERROR',
    error.message || i18n.global.t('roles.errors.network'),
  );
};

export const getRoles = async (page = 1, limit = 10) => {
  try {
    return await api.get<RoleListResponseDto>('/role', {
      params: { page, limit },
    });
  } catch (error) {
    handleApiError(error);
  }
};

export const getAllRoles = async () => {
  try {
    return await api.get<RoleResponseDto[]>('/role/admin/all');
  } catch (error) {
    handleApiError(error);
  }
};

export const getRoleById = async (id: string) => {
  try {
    if (!id.trim()) {
      throw new RoleApiError(
        'INVALID_ID',
        i18n.global.t('roles.errors.invalid_id'),
      );
    }
    return await api.get<RoleResponseDto>(`/role/${id}`);
  } catch (error) {
    handleApiError(error);
  }
};

export const createRole = async (payload: RoleCreationDto) => {
  try {
    if (!payload.name?.trim()) {
      throw new RoleApiError(
        'INVALID_NAME',
        i18n.global.t('roles.errors.invalid_name'),
      );
    }
    return await api.post<RoleResponseDto>('/role', payload);
  } catch (error) {
    handleApiError(error);
  }
};

export const updateRole = async (id: string, payload: RoleCreationDto) => {
  try {
    if (!id.trim()) {
      throw new RoleApiError(
        'INVALID_ID',
        i18n.global.t('roles.errors.invalid_id'),
      );
    }
    if (!payload.name?.trim()) {
      throw new RoleApiError('INVALID_NAME', 'Role name is required');
    }
    return await api.patch<RoleResponseDto>(`/role/${id}`, payload);
  } catch (error) {
    handleApiError(error);
  }
};

export const deleteRole = async (id: string) => {
  try {
    if (!id.trim()) {
      throw new RoleApiError(
        'INVALID_ID',
        i18n.global.t('roles.errors.invalid_id'),
      );
    }
    return await api.delete(`/role/${id}`);
  } catch (error) {
    handleApiError(error);
  }
};

export const getUsersByRole = async (roleId: string) => {
  try {
    if (!roleId.trim()) {
      throw new RoleApiError(
        'INVALID_ROLE_ID',
        i18n.global.t('roles.errors.invalid_role_id'),
      );
    }
    return await api.get<User[]>(`role/${roleId}/users`);
  } catch (error) {
    handleApiError(error);
  }
};

export const assignUserToRole = async (userId: string, roleId: string) => {
  try {
    if (!userId.trim()) {
      throw new RoleApiError(
        'INVALID_USER_ID',
        i18n.global.t('roles.errors.invalid_user_id'),
      );
    }
    if (!roleId.trim()) {
      throw new RoleApiError(
        'INVALID_ROLE_ID',
        i18n.global.t('roles.errors.invalid_role_id'),
      );
    }
    return await api.patch(`role/user/update-account/${userId}`, { roleId });
  } catch (error) {
    handleApiError(error);
  }
};

export const removeUserFromRole = async (userId: string) => {
  try {
    if (!userId.trim()) {
      throw new RoleApiError(
        'INVALID_USER_ID',
        i18n.global.t('roles.errors.invalid_user_id'),
      );
    }
    return await api.patch(`role/user/update-account/${userId}`, {
      roleId: null,
    });
  } catch (error) {
    handleApiError(error);
  }
};

export const bulkAssignUsersToRole = async (
  userIds: string[],
  roleId: string,
) => {
  try {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new RoleApiError(
        'INVALID_USER_IDS',
        i18n.global.t('roles.errors.invalid_user_ids'),
      );
    }
    if (!roleId.trim()) {
      throw new RoleApiError(
        'INVALID_ROLE_ID',
        i18n.global.t('roles.errors.invalid_role_id'),
      );
    }

    const results = await Promise.allSettled(
      userIds.map((userId) => assignUserToRole(userId, roleId)),
    );

    const failures = results.filter((result) => result.status === 'rejected');
    if (failures.length > 0) {
      throw new RoleApiError(
        'BULK_ASSIGNMENT_PARTIAL_FAILURE',
        i18n.global.t('roles.errors.bulk_assign_fail', {
          failed: failures.length,
          total: userIds.length,
        }),
        { failures },
      );
    }

    return results.map((result) =>
      result.status === 'fulfilled' ? result.value : null,
    );
  } catch (error) {
    if (error instanceof RoleApiError) {
      throw error;
    }
    handleApiError(error);
  }
};

export const getRolePermissions = async (roleId: string) => {
  try {
    if (!roleId.trim()) {
      throw new RoleApiError(
        'INVALID_ROLE_ID',
        i18n.global.t('roles.errors.invalid_role_id'),
      );
    }
    return await api.get(`/permissions/server/role/${roleId}`);
  } catch (error) {
    handleApiError(error);
  }
};

export const updateRolePermissions = async (
  serverId: string,
  roleId: string,
  payload: any,
) => {
  try {
    if (!serverId.trim()) {
      throw new RoleApiError(
        'INVALID_SERVER_ID',
        i18n.global.t('roles.errors.invalid_server_id'),
      );
    }
    if (!roleId.trim()) {
      throw new RoleApiError(
        'INVALID_ROLE_ID',
        i18n.global.t('roles.errors.invalid_role_id'),
      );
    }
    return await api.patch(
      `/permissions/server/${serverId}/role/${roleId}`,
      payload,
    );
  } catch (error) {
    handleApiError(error);
  }
};

export { RoleApiError };
