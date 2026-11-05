import type { IloConfig } from '../ilos/types';

export type ServerState = 'UP' | 'DOWN';
export type ServerType = 'vcenter' | 'esxi';

export interface ServerMetricsDto {
  cpuUsage: number;
  memoryUsage: number;
  powerState: string;
  uptime: number;
}

export interface IloStatusResponseDto {
  serverId: string;
  hasIlo: boolean;
  status: 'SUCCESS' | 'ERROR' | 'TIMEOUT' | 'UNKNOWN';
  metrics: ServerMetricsDto;
  message?: string;
  error?: string;
}

export type HostHealth = 'up' | 'degraded' | 'down' | 'unknown';

export interface HostMetrics {
  moid: string;
  name: string;
  serverId: string | null;
  upsId: string | null;
  health: HostHealth;
  connectionState: string | null;
  powerState: string | null;
  maintenance: boolean | null;
  cpuPercent: number | null;
  memoryPercent: number | null;
  uptimeSeconds: number | null;
  metricsAt: string | null;
}

export type HardwareHealth = 'OK' | 'Warning' | 'Critical';

export interface ServerHardware {
  inletC: number | null;
  consumedW: number | null;
  psu: { ok: number; total: number } | null;
  health: HardwareHealth | null;
  collectedAt: string | null;
}

export interface Server {
  id: string;
  name: string;
  ip: string;
  state: ServerState;
  adminUrl: string;
  login: string;
  password?: string;
  type: ServerType;
  priority: number;
  roomId: string;
  groupId: string;
  upsId?: string | null;
  ilo?: IloConfig | null;
  iloId?: string;
  vmwareHostMoid?: string;
  metrics?: ServerMetricsDto;
  hardware?: ServerHardware | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateServerPayload {
  name: string;
  ip: string;
  state: ServerState;
  adminUrl: string;
  login: string;
  password: string;
  type: ServerType;
  priority: number;
  roomId: string;
  groupId?: string;
  upsId?: string;
  ilo?: IloConfig;
}

export interface ServerListResponse {
  items: Server[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface ServerListParams {
  page?: number;
  limit?: number;
}

export interface VmLight {
  id: string;
  name: string;
  state: string;
}

export interface ServerWithVms {
  id: string;
  name: string;
  ip: string;
  hostMoid: string;
  vms: VmLight[];
}
