import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Server, CreateServerPayload } from './types';
import { fetchServers, createServer } from './api';

export const useServerStore = defineStore('servers', () => {
  const servers = ref<Server[]>([]);
  const isLoading = ref(false);
  const isCreating = ref(false);
  const error = ref<string | null>(null);

  const loadServers = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await fetchServers();
      servers.value = res.data;
    } catch (err: any) {
      error.value = err.message ?? 'Erreur lors du chargement';
    } finally {
      isLoading.value = false;
    }
  };

  const addServer = async (payload: CreateServerPayload) => {
    isCreating.value = true;
    error.value = null;
    try {
      const newServer = await createServer(payload);
      servers.value.push(newServer);
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

  return {
    servers,
    isLoading,
    isCreating,
    error,
    loadServers,
    addServer,
  };
});
