import api from '@/services/api';
import type { Server, CreateServerPayload } from './types';

export const fetchMyServers = () => {
  return api.get<Server[]>('/server');
};

export const createServer = async (payload: CreateServerPayload) => {
  const response = await api.post<Server>('/server', payload);
  return response.data;
};
