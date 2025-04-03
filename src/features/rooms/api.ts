import api from '@/services/api';

export const fetchUrooms = () => {
  console.log("Hello from rooms API");
  return api.get('/rooms');
};

export const createUrooms = (payload: any) => {
  console.log("Creating new rooms");
  return api.post('/rooms', payload);
};
