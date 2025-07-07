import axios from '@/services/api';
import type { PermissionServerDto, PermissionVmDto } from './types';

export interface BatchCreatePermissionDto {
  roleId: string;
  permissions: {
    serverId?: string;
    vmId?: string;
    bitmask: number;
  }[];
}

export interface BatchPermissionResponse {
  success: PermissionServerDto[] | PermissionVmDto[];
  failed: {
    permission: { serverId?: string; vmId?: string; bitmask: number };
    error: string;
  }[];
  stats: {
    total: number;
    success: number;
    failed: number;
  };
}

export interface CheckPermissionDto {
  serverId?: string;
  vmId?: string;
  permission: number;
}

export interface PermissionCheckResponse {
  hasPermission: boolean;
  bitmask: number;
}

export const permissionServerApi = {
  async getByRole(
    roleId: string,
    token: string,
  ): Promise<PermissionServerDto[]> {
    const { data } = await axios.get<PermissionServerDto[]>(
      `/permissions/server/role/${roleId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return data;
  },

  async getByIds(
    serverId: string,
    roleId: string,
    token: string,
  ): Promise<PermissionServerDto> {
    const { data } = await axios.get<PermissionServerDto>(
      `/permissions/server/${serverId}/role/${roleId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return data;
  },

  async create(
    dto: PermissionServerDto,
    token: string,
  ): Promise<PermissionServerDto> {
    const { data } = await axios.post<PermissionServerDto>(
      '/permissions/server',
      dto,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return data;
  },

  async update(
    serverId: string,
    roleId: string,
    dto: { bitmask: number },
    token: string,
  ): Promise<PermissionServerDto> {
    const { data } = await axios.patch<PermissionServerDto>(
      `/permissions/server/${serverId}/role/${roleId}`,
      dto,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return data;
  },

  async delete(serverId: string, roleId: string, token: string): Promise<void> {
    await axios.delete(`/permissions/server/${serverId}/role/${roleId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getUserPermissions(
    userId: string,
    token: string,
  ): Promise<PermissionServerDto[]> {
    const { data } = await axios.get<PermissionServerDto[]>(
      `/permissions/server/user/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return data;
  },

  async getMyPermissions(token: string): Promise<PermissionServerDto[]> {
    const { data } = await axios.get<PermissionServerDto[]>(
      '/permissions/server/user/me',
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return data;
  },
};

export const permissionVmApi = {
  async getByRole(roleId: string, token: string): Promise<PermissionVmDto[]> {
    const { data } = await axios.get<PermissionVmDto[]>(
      `/permissions/vm/role/${roleId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return data;
  },

  async getByIds(
    vmId: string,
    roleId: string,
    token: string,
  ): Promise<PermissionVmDto> {
    const { data } = await axios.get<PermissionVmDto>(
      `/permissions/vm/${vmId}/role/${roleId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return data;
  },

  async create(dto: PermissionVmDto, token: string): Promise<PermissionVmDto> {
    const { data } = await axios.post<PermissionVmDto>('/permissions/vm', dto, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  async update(
    vmId: string,
    roleId: string,
    dto: { bitmask: number },
    token: string,
  ): Promise<PermissionVmDto> {
    const { data } = await axios.patch<PermissionVmDto>(
      `/permissions/vm/${vmId}/role/${roleId}`,
      dto,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return data;
  },

  async delete(vmId: string, roleId: string, token: string): Promise<void> {
    await axios.delete(`/permissions/vm/${vmId}/role/${roleId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async getUserPermissions(
    userId: string,
    token: string,
  ): Promise<PermissionVmDto[]> {
    const { data } = await axios.get<PermissionVmDto[]>(
      `/permissions/vm/user/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return data;
  },

  async getMyPermissions(token: string): Promise<PermissionVmDto[]> {
    const { data } = await axios.get<PermissionVmDto[]>(
      '/permissions/vm/user/me',
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return data;
  },

  async createBatch(
    dto: BatchCreatePermissionDto,
    token: string,
  ): Promise<BatchPermissionResponse> {
    const { data } = await axios.post<BatchPermissionResponse>(
      '/permissions/vm/batch',
      dto,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return data;
  },

  async checkPermission(
    dto: CheckPermissionDto,
    token: string,
  ): Promise<PermissionCheckResponse> {
    const { data } = await axios.post<PermissionCheckResponse>(
      '/permissions/vm/check',
      dto,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return data;
  },
};

export const permissionBatchApi = {
  async createServerBatch(
    dto: BatchCreatePermissionDto,
    token: string,
  ): Promise<BatchPermissionResponse> {
    const { data } = await axios.post<BatchPermissionResponse>(
      '/permissions/server/batch',
      dto,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return data;
  },

  async checkServerPermission(
    dto: CheckPermissionDto,
    token: string,
  ): Promise<PermissionCheckResponse> {
    const { data } = await axios.post<PermissionCheckResponse>(
      '/permissions/server/check',
      dto,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return data;
  },
};
