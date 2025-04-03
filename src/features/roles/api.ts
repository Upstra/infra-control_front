import api from '@/services/api';

export const fetchUroles = () => {
  console.log("Hello from roles API");
  return api.get('/roles');
};

export const createUroles = (payload: any) => {
  console.log("Creating new roles");
  return api.post('/roles', payload);
};
