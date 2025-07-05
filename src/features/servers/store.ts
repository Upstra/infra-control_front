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
} from './api';

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
      // Update the server in the list if it exists
      const index = list.value.findIndex(s => s.id === id);
      if (index > -1) {
        list.value[index] = updatedServer;
      }
      // Update current if it's the same server
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
    // Legacy exports for compatibility
    servers: list,
    isLoading: loading,
    loadServers: fetchServers,
  };
});
