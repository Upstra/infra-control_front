import api from '@/services/api';

export const fetchUvms = () => {
  return api.get('/vms');
};

export const createUvms = (payload: any) => {
  return api.post('/vms', payload);
};

export const patchVm = async (
  id: string,
  data: { groupId?: string | null },
) => {
  const response = await api.patch(`/vm/${id}`, data);
  return response.data;
};
