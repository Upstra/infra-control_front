export interface VmMetrics {
  cpuUsage?: number;
  memoryUsage?: number;
  memoryMB?: number;
  storageGB?: number;
  powerState?: string;
  guestToolsStatus?: string;
  uptimeSeconds?: number;
}

export interface Vm {
  id: string;
  name: string;
  moid?: string;
  state: string;
  grace_period_on: number;
  grace_period_off: number;
  os?: string;
  guestOs?: string;
  guestFamily?: string;
  version?: string;
  createDate?: string;
  numCoresPerSocket?: number;
  numCPU?: number;
  esxiHostName?: string;
  esxiHostMoid?: string;
  adminUrl?: string;
  ip?: string;
  priority: number;
  groupId?: string | null;
  serverId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  metrics?: VmMetrics;
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
  includeMetrics?: boolean;
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
