import api from '@/services/api';
import type {
  Vm,
  VmListResponse,
  VmListParams,
  CreateVmPayload,
  UpdateVmPayload,
} from './types';

export const fetchUvms = () => {
  return api.get('/vm');
};

export const createUvms = (payload: CreateVmPayload) => {
  return api.post<Vm>('/vm', payload);
};

export const patchVm = async (id: string, data: UpdateVmPayload) => {
  const response = await api.patch<Vm>(`/vm/${id}`, data);
  return response.data;
};

export const fetchVmById = async (id: string): Promise<Vm> => {
  const response = await api.get<Vm>(`/vm/${id}`);
  return response.data;
};

export const fetchVms = async (
  params: VmListParams = {},
): Promise<VmListResponse> => {
  const { page = 1, limit = 10, search, serverId } = params;
  const response = await api.get<VmListResponse>('/vm', {
    params: { page, limit, search, serverId },
  });
  return response.data;
};

export const getVmsAdmin = async (): Promise<Vm[]> => {
  const response = await api.get<Vm[]>('/vm/admin/all');
  return response.data;
};
