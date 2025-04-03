import api from '@/services/api';

export const fetchUilos = () => {
  console.log("Hello from ilos API");
  return api.get('/ilos');
};

export const createUilos = (payload: any) => {
  console.log("Creating new ilos");
  return api.post('/ilos', payload);
};
