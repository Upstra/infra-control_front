import api from '@/services/api';

export const fetchUilos = () => {
  return api.get('/ilos');
};

export const createUilos = (payload: any) => {
  return api.post('/ilos', payload);
};
