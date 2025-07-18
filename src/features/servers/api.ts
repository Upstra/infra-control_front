import api from '@/services/api';
import type {
  Server,
  CreateServerPayload,
  ServerListResponse,
  ServerListParams,
  IloStatusResponseDto,
  ServerWithVms,
} from './types';

export const fetchServers = (params: ServerListParams = {}) => {
  const { page = 1, limit = 10 } = params;
  return api.get<ServerListResponse>('/server', {
    params: { page, limit },
  });
};

export const fetchMyServers = fetchServers;

export const fetchServerById = async (id: string): Promise<Server> => {
  try {
    const response = await api.get<Server>(`/server/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching server with id ${id}:`, error);
    throw new Error(
      error.response.data.message || `Server with id ${id} not found`,
    );
  }
};

export const createServer = async (payload: CreateServerPayload) => {
  const response = await api.post<Server>('/server', payload);
  return response.data;
};

export const getServersAdmin = async (): Promise<Server[]> => {
  const response = await api.get<Server[]>('/server/admin/all');
  return response.data;
};

export const fetchServersLight = async (): Promise<ServerWithVms[]> => {
  try {
    const response = await api.get<ServerWithVms[]>('/server/light-with-vms');
    return response.data;
  } catch (error) {
    console.error('Error fetching servers light:', error);
    return [];
  }
};

export const patchServer = async (
  id: string,
  data: { groupId?: string | null },
) => {
  const response = await api.patch<Server>(`/server/${id}`, data);
  return response.data;
};

export const updateServer = async (
  id: string,
  data: Partial<Server>,
): Promise<Server> => {
  const response = await api.patch<Server>(`/server/${id}`, data);
  return response.data;
};

export const pingServer = async (id: string) => {
  const response = await api.post(`/server/${id}/ping`);
  return response.data;
};

export const pingIlo = async (serverId: string) => {
  const response = await api.post(`/ilo/servers/${serverId}/ping`);
  return response.data;
};

export const pingServerByIp = async (ip: string) => {
  const response = await api.get(`/ping/hostname/${ip}`);
  return response.data;
};

export const pingIloByIp = async (ip: string) => {
  const response = await api.get(`/ping/hostname/${ip}`);
  return response.data;
};

export const discoverVms = async (serverId: string) => {
  const response = await api.get(`/server/${serverId}/vms`);
  return response.data;
};

export const getServerInfo = async (serverId: string) => {
  const response = await api.get(`/server/${serverId}/info`);
  return response.data;
};

export const controlServerPower = async (
  serverId: string,
  action: 'start' | 'stop' | 'reset',
) => {
  const response = await api.post(`/ilo/servers/${serverId}/power`, {
    action,
  });
  return response.data;
};

export const getServerPowerStatus = async (
  serverId: string,
): Promise<IloStatusResponseDto> => {
  const response = await api.get<IloStatusResponseDto>(
    `/ilo/servers/${serverId}/status`,
  );
  return response.data;
};

export const getServersByUpsId = async (upsId: string): Promise<Server[]> => {
  try {
    const response = await api.get<Server[]>(`/ups/${upsId}/servers`);
    return response.data;
  } catch {
    // Fallback: filter all servers by upsId
    const allServersResponse = await fetchServers({ limit: 100 });
    return allServersResponse.data.items.filter(
      (server) => server.upsId === upsId,
    );
  }
};
