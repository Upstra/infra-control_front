import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
  Server,
  CreateServerPayload,
  ServerListResponse,
  ServerListParams,
} from './types';
import {
  fetchServers as fetchServersApi,
  createServer,
  getServersAdmin,
  updateServer,
  fetchServerById,
  pingServer as pingServerApi,
  controlServerPower as controlServerPowerApi,
  getServerPowerStatus as getServerPowerStatusApi,
  deleteServer as deleteServerApi,
} from './api';
import { useAuthStore } from '@/features/auth/store';
import { PermissionBit, PermissionUtils } from '@/shared/utils/permissions';

export const useServerStore = defineStore('servers', () => {
  const list = ref<Server[]>([]);
  const current = ref<Server | null>(null);
  const loading = ref(false);
  const isCreating = ref(false);
  const error = ref<string | null>(null);
  const totalItems = ref(0);
  const currentPage = ref(1);
  const totalPages = ref(1);
  const hasMore = ref(true);

  const fetchServers = async (page = 1, limit = 12, append = false) => {
    loading.value = true;
    error.value = null;

    try {
      const params: ServerListParams = { page, limit };
      const res = await fetchServersApi(params);
      const response: ServerListResponse = res.data;

      if (append) {
        list.value = [...list.value, ...response.items];
      } else {
        list.value = response.items;
      }

      totalItems.value = response.totalItems;
      currentPage.value = response.currentPage;
      totalPages.value = response.totalPages;
      hasMore.value = response.currentPage < response.totalPages;

      return response;
    } catch (err: any) {
      error.value = err.message ?? 'Erreur lors du chargement';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchServersAdmin = async () => {
    loading.value = true;
    error.value = null;

    try {
      list.value = await getServersAdmin();
    } catch (err: any) {
      error.value = err.message ?? 'Erreur lors du chargement';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const loadMore = async (limit = 12) => {
    if (!hasMore.value || loading.value) return;
    await fetchServers(currentPage.value + 1, limit, true);
  };

  const addServer = async (payload: CreateServerPayload) => {
    isCreating.value = true;
    error.value = null;
    try {
      const newServer = await createServer(payload);
      await fetchServers(1, 12);
      return newServer;
    } catch (err: any) {
      error.value =
        err.response?.data?.message ??
        err.message ??
        'Erreur lors de la création';
      throw err;
    } finally {
      isCreating.value = false;
    }
  };

  const loadServerById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const server = await fetchServerById(id);
      current.value = server;
      return server;
    } catch (err: any) {
      error.value = err.message ?? 'Erreur lors du chargement du serveur';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const editServer = async (id: string, data: Partial<Server>) => {
    loading.value = true;
    error.value = null;
    try {
      const updatedServer = await updateServer(id, data);
      const index = list.value.findIndex((s) => s.id === id);
      if (index > -1) {
        list.value[index] = updatedServer;
      }
      if (current.value?.id === id) {
        current.value = updatedServer;
      }
      return updatedServer;
    } catch (err: any) {
      error.value =
        err.response?.data?.message ??
        err.message ??
        'Erreur lors de la mise à jour';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const pingServer = async (id: string) => {
    try {
      const result = await pingServerApi(id);
      return result;
    } catch (err: any) {
      throw err;
    }
  };

  const controlServerPower = async (
    id: string,
    action: 'start' | 'stop' | 'reset',
  ) => {
    try {
      const result = await controlServerPowerApi(id, action);
      return result;
    } catch (err: any) {
      throw err;
    }
  };

  const getServerPowerStatus = async (id: string) => {
    try {
      const result = await getServerPowerStatusApi(id);
      return result;
    } catch (err: any) {
      throw err;
    }
  };

  const canDeleteServer = (server?: Server) => {
    if (!server) return false;
    const authStore = useAuthStore();
    const user = authStore.currentUser;

    if (!user) return false;
    if (user.roles?.some((role) => role.isAdmin)) return true;

    for (const role of user.roles || []) {
      const serverPermission = role.permissionServers?.find(
        (perm) => perm.serverId === server.id,
      );
      if (
        serverPermission &&
        PermissionUtils.has(serverPermission.bitmask, PermissionBit.DELETE)
      ) {
        return true;
      }
    }

    return false;
  };

  const removeServer = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      await deleteServerApi(id);
      list.value = list.value.filter((s) => s.id !== id);
      if (current.value?.id === id) {
        current.value = null;
      }
    } catch (err: any) {
      error.value =
        err.response?.data?.message ??
        err.message ??
        'Erreur lors de la suppression';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    list,
    current,
    loading,
    isCreating,
    error,
    totalItems,
    currentPage,
    totalPages,
    hasMore,
    fetchServers,
    fetchServersAdmin,
    loadMore,
    addServer,
    loadServerById,
    editServer,
    pingServer,
    controlServerPower,
    getServerPowerStatus,
    canDeleteServer,
    removeServer,
    servers: list,
    isLoading: loading,
    loadServers: fetchServers,
  };
});
