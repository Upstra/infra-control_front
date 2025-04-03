import api from '@/services/api';

export const fetchUgroups = () => {
  console.log("Hello from groups API");
  return api.get('/groups');
};

export const createUgroups = (payload: any) => {
  console.log("Creating new groups");
  return api.post('/groups', payload);
};
