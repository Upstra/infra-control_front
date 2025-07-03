export type GroupPriority = number;
export type GroupType = 'server' | 'vm';

export interface GroupServerResponseDto {
  id: string;
  name: string;
  priority: number;
  description?: string;
  cascade: boolean;
  roomId?: string;
  serverIds: string[];
  vmGroupIds: string[];
  type: 'server';
}

export interface GroupVmResponseDto {
  id: string;
  name: string;
  priority: number;
  description?: string;
  cascade: boolean;
  roomId?: string;
  serverGroupId: string;
  vmIds: string[];
  type: 'vm';
}

export interface GroupServerListResponseDto {
  items: GroupServerResponseDto[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface GroupVmListResponseDto {
  items: GroupVmResponseDto[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface ShutdownStep {
  order: number;
  type: 'vm' | 'server';
  entityId: string;
  entityName: string;
  groupId: string;
  groupName: string;
  priority: number;
}

export interface ShutdownPreviewListResponseDto {
  items: ShutdownStep[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  totalVms: number;
  totalServers: number;
}

export interface ShutdownRequestDto {
  groupIds: string[];
}

export interface ServerGroupListParams {
  page?: number;
  limit?: number;
  roomId?: string;
  priority?: number;
}

export interface VmGroupListParams {
  page?: number;
  limit?: number;
}

export interface ShutdownPreviewParams {
  page?: number;
  limit?: number;
}

export interface CreateGroupPayload {
  name: string;
  description?: string;
  type: GroupType;
  priority: number;
  cascade: boolean;
  roomId?: string;
  resourceIds: string[];
  serverGroupId?: string; // Required for VM groups
}

export interface UpdateGroupPayload {
  name?: string;
  description?: string;
  type: GroupType;
  priority?: number;
  cascade?: boolean;
  roomId?: string;
  resourceIds?: string[];
  serverGroupId?: string; // For VM groups
}

export type Group = GroupServerResponseDto | GroupVmResponseDto;

export type GroupWithResources = Group & {
  resources: Array<{
    id: string;
    name: string;
    state: 'active' | 'inactive';
  }>;
};
