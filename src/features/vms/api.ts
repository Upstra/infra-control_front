import api from '@/services/api';

export const fetchUvms = () => {
  return api.get('/vms');
};

export const createUvms = (payload: any) => {
  return api.post('/vms', payload);
};
