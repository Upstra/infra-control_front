import api from '@/services/api';

export const fetchUvms = () => {
  console.log("Hello from vms API");
  return api.get('/vms');
};

export const createUvms = (payload: any) => {
  console.log("Creating new vms");
  return api.post('/vms', payload);
};
