import api from '@/services/api';

export const fetchUups = () => {
  console.log("Hello from ups API");
  return api.get('/ups');
};

export const createUups = (payload: any) => {
  console.log("Creating new ups");
  return api.post('/ups', payload);
};
