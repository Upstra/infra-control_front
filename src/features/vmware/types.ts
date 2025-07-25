export interface DiscoveryProgressDto {
  status: 'starting' | 'discovering' | 'completed' | 'error' | 'cancelled';
  currentServer?: string;
  progress?: number;
  serversProcessed?: number;
  totalServers?: number;
  discoveredVms?: number;
  error?: string;
  timestamp: Date;
}

export interface DiscoveredVmDto {
  moid: string;
  name: string;
  ip?: string;
  guestOs?: string;
  powerState?: string;
  memoryMB?: number;
  numCpu?: number;
  serverId: string;
  serverName: string;
  esxiHostMoid?: string;
}

export interface ServerDiscoveryResult {
  serverId: string;
  serverName: string;
  success: boolean;
  error?: string;
  vmCount: number;
  vms: DiscoveredVmDto[];
}

export interface DiscoveryResultsDto {
  totalVmsDiscovered: number;
  totalServersProcessed: number;
  successfulServers: number;
  failedServers: number;
  serverResults: ServerDiscoveryResult[];
  allDiscoveredVms: DiscoveredVmDto[];
}

export interface BulkCreateWithDiscoveryRequestDto {
  rooms: any[];
  upsList: any[];
  servers: any[];
  idMapping?: any;
  enableDiscovery?: boolean;
  discoverySessionId?: string;
}

export interface BulkCreateWithDiscoveryResponseDto {
  success: boolean;
  created: {
    rooms: any[];
    upsList: any[];
    servers: any[];
  };
  idMapping: {
    rooms: Record<string, string>;
    ups: Record<string, string>;
  };
  discoverySessionId?: string;
  discoveryTriggered?: boolean;
  vmwareServerCount?: number;
}

export interface DiscoveryStartDto {
  sessionId: string;
  serverCount: number;
}

export interface DiscoverySessionDto {
  sessionId: string;
  status: 'starting' | 'discovering' | 'completed' | 'error' | 'cancelled';
  totalServers: number;
  serversProcessed: number;
  successfulServers: number;
  failedServers: number;
  totalVmsDiscovered: number;
  serverResults: ServerDiscoveryResult[];
  failedServerIds: string[];
  currentServer?: string;
  progress: number;
  error?: string;
  startedAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface ActiveDiscoveryDto {
  active: boolean;
  session?: DiscoverySessionDto;
}
