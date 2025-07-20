export type GroupType = 'VM' | 'SERVER';

export interface GroupResponseDto {
  id: string;
  name: string;
  description?: string;
  type: GroupType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  serverCount?: number;
  vmCount?: number;
}

export interface PaginatedGroupResponseDto {
  data: GroupResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

export type Group = GroupResponseDto;
export type GroupPriority = number;
