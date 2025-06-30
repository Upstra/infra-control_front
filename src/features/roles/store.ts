import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Role } from './types';
import {
  getAllRoles,
  getRoleById,
  createRole as apiCreateRole,
  updateRole as apiUpdateRole,
  deleteRole as apiDeleteRole,
} from './api';
import { getMockRoles } from './mock';

export const useRolesStore = defineStore('roles', () => {
  const roles = ref<Role[]>([]);
  const loading = ref(false);
  const isMock = ref(false);
  const error = ref<string | null>(null);

  const fetchAllRoles = async () => {
    loading.value = true;
    isMock.value = false;
    error.value = null;
    try {
      const { data } = await getAllRoles();
      roles.value = data;
    } catch (err: any) {
      roles.value = getMockRoles();
      isMock.value = true;
      error.value = err.message ?? 'Error fetching roles';
    } finally {
      loading.value = false;
    }
  };

  const fetchRole = async (id: string): Promise<Role | null> => {
    try {
      const { data } = await getRoleById(id);
      return data;
    } catch {
      return null;
    }
  };

  const createRole = async (payload: any) => {
    await apiCreateRole(payload);
    await fetchAllRoles();
  };

  const updateRole = async (id: string, payload: any) => {
    await apiUpdateRole(id, payload);
    await fetchAllRoles();
  };

  const deleteRole = async (id: string) => {
    await apiDeleteRole(id);
    await fetchAllRoles();
  };

  return {
    roles,
    loading,
    isMock,
    error,
    fetchAllRoles,
    fetchRole,
    createRole,
    updateRole,
    deleteRole,
  };
});
