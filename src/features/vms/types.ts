export interface Vm {
  id: string;
  name: string;
  serverId: string;
  groupId?: string | null;
  state?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface VmListResponse {
  items: Vm[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface VmListParams {
  page?: number;
  limit?: number;
  search?: string;
  serverId?: string;
}

export interface CreateVmPayload {
  name: string;
  serverId: string;
  groupId?: string | null;
}

export interface UpdateVmPayload {
  name?: string;
  groupId?: string | null;
}
