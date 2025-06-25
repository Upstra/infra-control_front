import api from '@/services/api';

export const fetchRoles = () => {
  return api.get('/roles');
};

export const createUroles = (payload: any) => {
  return api.post('/roles', payload);
};
