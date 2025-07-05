export type Priority = number; // 1-999

export interface ServerWithPriority {
  id: string;
  name: string;
  priority: Priority;
  ipAddress?: string;
  state?: 'active' | 'inactive' | 'maintenance';
}

export interface VMWithPriority {
  id: string;
  name: string;
  serverId: string;
  priority: Priority;
  state?: 'running' | 'stopped' | 'paused';
}

export interface UpdatePriorityDto {
  priority: Priority;
}

export interface SwapPriorityResult {
  item1: { id: string; priority: Priority };
  item2: { id: string; priority: Priority };
}

export interface ServerPriorityResponse {
  id: string;
  name: string;
  priority: Priority;
  ipAddress: string;
  state: 'active' | 'inactive' | 'maintenance';
}

export interface VmPriorityResponse {
  id: string;
  name: string;
  serverId: string;
  priority: Priority;
  state: 'running' | 'stopped' | 'paused';
}

export interface SwapServerPriorityResponse {
  server1: { id: string; priority: Priority };
  server2: { id: string; priority: Priority };
}

export interface SwapVmPriorityResponse {
  vm1: { id: string; priority: Priority };
  vm2: { id: string; priority: Priority };
}
