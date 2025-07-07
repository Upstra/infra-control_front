import type { Role } from '../roles/types';

export interface UserResponseDto {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: Role[];
  active: boolean;
  isTwoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User extends UserResponseDto {}

export interface UserUpdateDto {
  username?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  email?: string;
  roleIds?: string[];
}

export interface UserCreateDto {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roleIds?: string[];
}

export interface UserListResponseDto {
  items: UserResponseDto[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface PermissionServerDto {
  id?: string;
  roleId: string;
  serverId: string;
  bitmask: number;
}

export interface UpdatePermissionServerDto {
  bitmask: number;
}

export interface PermissionVmDto {
  id?: string;
  roleId: string;
  vmId: string;
  bitmask: number;
}

export interface RoleWithPermissions {
  id: string;
  name: string;
  permissionServers: PermissionServerDto[];
  permissionVms: PermissionVmDto[];
  canCreateServer: boolean;
  isAdmin: boolean;
}
