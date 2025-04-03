import api from '@/services/api';

export const fetchUservers = () => {
  console.log("Hello from servers API");
  return api.get('/servers');
};

export const createUservers = (payload: any) => {
  console.log("Creating new servers");
  return api.post('/servers', payload);
};
