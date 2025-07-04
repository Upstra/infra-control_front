export type GroupType = 'VM' | 'SERVER';

export interface GroupResponseDto {
  id: string;
  name: string;
  description?: string;
  type: GroupType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedGroupResponseDto {
  data: GroupResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ShutdownResourceDto {
  id: string;
  name: string;
  priority: number;
  state: string;
  shutdownOrder: number;
}

export interface PreviewShutdownResponseDto {
  groupId: string;
  groupName: string;
  groupType: GroupType;
  resources: ShutdownResourceDto[];
  totalResources: number;
  estimatedDuration: number;
}

export interface GroupShutdownDto {
  force?: boolean;
  delayBetween?: number;
}

export interface GroupQueryDto {
  page?: number;
  limit?: number;
  type?: GroupType;
  search?: string;
}

export interface CreateGroupDto {
  name: string;
  description?: string;
  type: GroupType;
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
}

// Legacy type aliases for backward compatibility with components
export type Group = GroupResponseDto;
export type GroupPriority = number;
