import api from '@/services/api';
import type { Server, CreateServerPayload } from './types';

// TODO: replace by api call
export const getMockServers = (): Server[] => [
  {
    id: '1',
    name: 'Production Web Server',
    ip: '192.168.1.10',
    state: 'active',
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
    state: 'active',
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
    state: 'inactive',
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

export const fetchServers = () => {
  return api.get<Server[]>('/server');
};

export const createServer = async (payload: CreateServerPayload) => {
  const response = await api.post<Server>('/server', payload);
  return response.data;
};
