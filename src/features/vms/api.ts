import api from '@/services/api';
import type {
  Vm,
  VmListResponse,
  VmListParams,
  CreateVmPayload,
  UpdateVmPayload,
} from './types';

export const createvms = (payload: CreateVmPayload) => {
  return api.post<Vm>('/vm', payload);
};

export const fetchVms = async (
  params: VmListParams = {},
): Promise<VmListResponse> => {
  const { page = 1, limit = 10, search, serverId, includeMetrics } = params;
  const response = await api.get<VmListResponse>('/vm', {
    params: { page, limit, search, serverId, includeMetrics },
  });
  return response.data;
};

export const fetchUvms = fetchVms;

export const patchVm = async (id: string, data: UpdateVmPayload) => {
  const response = await api.patch<Vm>(`/vm/${id}`, data);
  return response.data;
};

export const fetchVmById = async (
  id: string,
  includeMetrics = false,
): Promise<Vm> => {
  const response = await api.get<Vm>(`/vm/${id}`, {
    params: { includeMetrics },
  });
  return response.data;
};

export const getVmsAdmin = async (includeMetrics = false): Promise<Vm[]> => {
  const response = await api.get<Vm[]>('/vm/admin/all', {
    params: { includeMetrics },
  });
  return response.data;
};
