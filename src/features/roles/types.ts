export interface PermissionServerDto {
  roleId: string;
  serverId: string;
  bitmask: number;
}

export interface PermissionVmDto {
  vmId: string;
  roleId: string;
  bitmask: number;
}

export interface Role {
  id: string;
  name: string;
  isAdmin?: boolean;
  permissionServers?: PermissionServerDto[];
  permissionVms?: PermissionVmDto[];
  canCreateServer?: boolean;
}

export interface RoleResponseDto {
  id: string;
  name: string;
  permissionServers: PermissionServerDto[];
  permissionVms: PermissionVmDto[];
  canCreateServer: boolean;
  isAdmin: boolean;
}

export interface RoleCreationDto {
  name: string;
}

export interface AdminRoleCreationDto extends RoleCreationDto {
  isAdmin: boolean;
  canCreateServer: boolean;
}

export interface RoleListResponseDto {
  items: RoleResponseDto[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  roleId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleWithUsers extends RoleResponseDto {
  users: User[];
  userCount: number;
}

export interface RolePermission {
  id: string;
  roleId: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface RoleAssignmentRequest {
  userIds: string[];
  roleId: string;
}

export interface RoleUpdateRequest extends RoleCreationDto {
  permissions?: RolePermission[];
}

export interface RoleApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface RoleError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface RoleValidationError {
  field: string;
  message: string;
  code: string;
}

export interface RoleStoreState {
  roles: Role[];
  rolesWithUsers: RoleWithUsers[];
  selectedRole: RoleWithUsers | null;
  loading: boolean;
  userLoading: boolean;
  isMock: boolean;
  error: string | null;
  validationErrors: RoleValidationError[];
}

export interface CreateRoleModalProps {
  isOpen: boolean;
  role?: RoleWithUsers | null;
}

export interface AssignUsersModalProps {
  isOpen: boolean;
  role?: RoleWithUsers | null;
}

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  role?: RoleWithUsers | null;
}

export type RoleModalEmits = {
  close: () => void;
  save: (data: RoleCreationDto) => void;
};

export type AssignUsersModalEmits = {
  close: () => void;
  assign: (userIds: string[]) => void;
};

export type ConfirmDeleteModalEmits = {
  close: () => void;
  confirm: () => void;
};

export enum RolePermissionAction {
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
  ADMIN = 'ADMIN',
}

export enum RolePermissionResource {
  SERVER = 'SERVER',
  VM = 'VM',
  USER = 'USER',
  ROLE = 'ROLE',
  ROOM = 'ROOM',
  UPS = 'UPS',
}

export interface RoleStats {
  totalRoles: number;
  adminRoles: number;
  regularRoles: number;
  totalUsersWithRoles: number;
  rolesWithoutUsers: number;
}
