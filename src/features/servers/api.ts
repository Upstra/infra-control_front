import api from '@/services/api';
import type {
  Server,
  CreateServerPayload,
  ServerListResponse,
  ServerListParams,
} from './types';

export const getMockServers = (): Server[] => [
  {
    id: '1',
    name: 'Production Web Server',
    ip: '192.168.1.10',
    state: 'UP',
    adminUrl: 'https://web01.local',
    login: 'admin',
    type: 'physical',
    priority: 1,
    grace_period_on: 30,
    grace_period_off: 60,
    roomId: 'room-1',
    groupId: 'group-web',
    upsId: 'ups-1',
    ilo: {
      name: 'Web01 iLO',
      ip: '192.168.1.110',
      login: 'admin',
      password: 'pass',
    },
  },
  {
    id: '2',
    name: 'Database Server Primary',
    ip: '192.168.1.20',
    state: 'UP',
    adminUrl: 'https://db01.local',
    login: 'admin',
    type: 'physical',
    priority: 1,
    grace_period_on: 45,
    grace_period_off: 90,
    roomId: 'room-1',
    groupId: 'group-db',
    upsId: 'ups-2',
    ilo: {
      name: 'DB01 iLO',
      ip: '192.168.1.120',
      login: 'admin',
      password: 'pass',
    },
  },
  {
    id: '3',
    name: 'Application Server VM',
    ip: '192.168.1.30',
    state: 'DOWN',
    adminUrl: 'https://app01.local',
    login: 'admin',
    type: 'virtual',
    priority: 2,
    grace_period_on: 15,
    grace_period_off: 30,
    roomId: 'room-2',
    groupId: 'group-app',
    upsId: null,
    ilo: null,
  },
];

export const getMockServerListResponse = (
  page: number = 1,
  limit: number = 10,
): ServerListResponse => {
  const allServers = getMockServers();
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const items = allServers.slice(startIndex, endIndex);

  return {
    items,
    totalItems: allServers.length,
    totalPages: Math.ceil(allServers.length / limit),
    currentPage: page,
  };
};

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
  } catch {
    const mockServers = getMockServers();
    const mockServer = mockServers.find((s) => s.id === id);
    if (!mockServer) {
      throw new Error(`Server with id ${id} not found`);
    }
    return mockServer;
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
  const response = await api.put<Server>(`/server/${id}`, data);
  return response.data;
};
