import api from '@/services/api';

export const getRoles = (page = 1, limit = 10) => {
  return api.get('/role', { params: { page, limit } });
};

export const getAllRoles = () => {
  return api.get('/role/admin/all');
};

export const getRoleById = (id: string) => {
  return api.get(`/role/${id}`);
};

export const createRole = (payload: any) => {
  return api.post('/role', payload);
};

export const updateRole = (id: string, payload: any) => {
  return api.patch(`/role/${id}`, payload);
};

export const deleteRole = (id: string) => {
  return api.delete(`/role/${id}`);
};
