export type GroupPriority = 1 | 2 | 3 | 4;
export type GroupType = 'server' | 'vm';

export interface BaseGroup {
  id: string;
  name: string;
  description?: string;
  priority: GroupPriority;
  cascade: boolean;
  roomId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServerGroup extends BaseGroup {
  type: 'server';
  serverIds: string[];
}

export interface VmGroup extends BaseGroup {
  type: 'vm';
  vmIds: string[];
}

export type Group = ServerGroup | VmGroup;

export interface CreateGroupPayload {
  name: string;
  description?: string;
  type: GroupType;
  priority: GroupPriority;
  cascade: boolean;
  roomId?: string;
  resourceIds: string[];
}

export interface UpdateGroupPayload {
  name?: string;
  description?: string;
  priority?: GroupPriority;
  cascade?: boolean;
  resourceIds?: string[];
}

export interface GroupListResponse {
  items: Group[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface GroupListParams {
  page?: number;
  limit?: number;
  type?: GroupType;
  roomId?: string;
}

export type GroupWithResources = Group & {
  resources: Array<{
    id: string;
    name: string;
    state: 'active' | 'inactive';
  }>;
};