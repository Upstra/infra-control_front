import api from '@/services/api';

export const fetchUusers = () => {
  console.log("Hello from users API");
  return api.get('/users');
};

export const createUusers = (payload: any) => {
  console.log("Creating new users");
  return api.post('/users', payload);
};
