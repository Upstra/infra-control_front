export interface VmMetrics {
  cpuUsage?: number;
  memoryUsage?: number;
  memoryMB?: number;
  storageGB?: number;
  powerState?: string;
  guestToolsStatus?: string;
  uptimeSeconds?: number;
}

export type VmHealth = 'up' | 'degraded' | 'down' | 'unknown';

export type PowerOffCause = 'ha' | 'upstra' | 'manual';

export interface PowerOff {
  at: string;
  cause: PowerOffCause;
  by: string | null;
}

export interface VmTelemetry {
  moid: string;
  name: string;
  hostMoid: string | null;
  powerState: string | null;
  connectionState: string | null;
  guestState: string | null;
  heartbeat: string | null;
  overallStatus: string | null;
  cpuUsageMhz: number | null;
  cpuMaxMhz: number | null;
  cpuPercent: number | null;
  memoryUsageMb: number | null;
  memoryMb: number | null;
  numCpu: number | null;
  uptimeSeconds: number | null;
  bootTime: string | null;
  ip: string | null;
  health: VmHealth;
  metricsAt: string | null;
}

export interface VmPoweredOffEvent {
  moid: string;
  name: string;
  hostMoid: string | null;
  powerOff: PowerOff;
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
  health?: VmHealth;
  cpuPercent?: number | null;
  uptimeSeconds?: number | null;
  powerOff?: PowerOff | null;
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
  health?: 'issues';
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
