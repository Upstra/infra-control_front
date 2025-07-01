import api from '@/services/api';
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
      errorData.message || 'An error occurred',
      errorData.details,
    );
  }
  throw new RoleApiError(
    'NETWORK_ERROR',
    error.message || 'Network error occurred',
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
      throw new RoleApiError('INVALID_ID', 'Role ID is required');
    }
    return await api.get<RoleResponseDto>(`/role/${id}`);
  } catch (error) {
    handleApiError(error);
  }
};

export const createRole = async (payload: RoleCreationDto) => {
  try {
    if (!payload.name?.trim()) {
      throw new RoleApiError('INVALID_NAME', 'Role name is required');
    }
    return await api.post<RoleResponseDto>('/role', payload);
  } catch (error) {
    handleApiError(error);
  }
};

export const updateRole = async (id: string, payload: RoleCreationDto) => {
  try {
    if (!id.trim()) {
      throw new RoleApiError('INVALID_ID', 'Role ID is required');
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
      throw new RoleApiError('INVALID_ID', 'Role ID is required');
    }
    return await api.delete(`/role/${id}`);
  } catch (error) {
    handleApiError(error);
  }
};

// Admin-specific API endpoints
export const getUsersByRole = async (roleId: string) => {
  try {
    if (!roleId.trim()) {
      throw new RoleApiError('INVALID_ROLE_ID', 'Role ID is required');
    }
    return await api.get<User[]>(`/user`, { params: { roleId } });
  } catch (error) {
    handleApiError(error);
  }
};

export const assignUserToRole = async (userId: string, roleId: string) => {
  try {
    if (!userId.trim()) {
      throw new RoleApiError('INVALID_USER_ID', 'User ID is required');
    }
    if (!roleId.trim()) {
      throw new RoleApiError('INVALID_ROLE_ID', 'Role ID is required');
    }
    return await api.patch(`/user/update-account/${userId}`, { roleId });
  } catch (error) {
    handleApiError(error);
  }
};

export const removeUserFromRole = async (userId: string) => {
  try {
    if (!userId.trim()) {
      throw new RoleApiError('INVALID_USER_ID', 'User ID is required');
    }
    return await api.patch(`/user/update-account/${userId}`, { roleId: null });
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
      throw new RoleApiError('INVALID_USER_IDS', 'User IDs array is required');
    }
    if (!roleId.trim()) {
      throw new RoleApiError('INVALID_ROLE_ID', 'Role ID is required');
    }

    const results = await Promise.allSettled(
      userIds.map((userId) => assignUserToRole(userId, roleId)),
    );

    const failures = results.filter((result) => result.status === 'rejected');
    if (failures.length > 0) {
      throw new RoleApiError(
        'BULK_ASSIGNMENT_PARTIAL_FAILURE',
        `Failed to assign ${failures.length} out of ${userIds.length} users`,
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
      throw new RoleApiError('INVALID_ROLE_ID', 'Role ID is required');
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
      throw new RoleApiError('INVALID_SERVER_ID', 'Server ID is required');
    }
    if (!roleId.trim()) {
      throw new RoleApiError('INVALID_ROLE_ID', 'Role ID is required');
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
