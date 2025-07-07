import api from '@/services/api';

export const fetchUvms = () => {
  return api.get('/vm');
};

export const createUvms = (payload: any) => {
  return api.post('/vm', payload);
};

export const patchVm = async (
  id: string,
  data: { groupId?: string | null },
) => {
  const response = await api.patch(`/vm/${id}`, data);
  return response.data;
};

export const fetchVmById = async (id: string) => {
  const response = await api.get(`/vm/${id}`);
  return response.data;
};
