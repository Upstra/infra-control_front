import api from '@/services/api';

export const fetchUgroups = () => {
  return api.get('/groups');
};

export const createUgroups = (payload: any) => {
  return api.post('/groups', payload);
};
