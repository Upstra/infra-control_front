import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { fetchServers } from './api';
import type { Server } from './types';

const LIMIT = 100;

export const useServerInventoryStore = defineStore('serverInventory', () => {
  const servers = ref<Server[]>([]);
  const loading = ref(false);
  const loaded = ref(false);
  const error = ref<string | null>(null);

  const byId = computed<Record<string, Server>>(() =>
    Object.fromEntries(servers.value.map((server) => [server.id, server])),
  );

  const load = async () => {
    loading.value = true;
    try {
      const { data } = await fetchServers({ page: 1, limit: LIMIT });
      servers.value = data.items;
      loaded.value = true;
      error.value = null;
    } catch (e: any) {
      error.value = e?.message ?? 'servers';
    } finally {
      loading.value = false;
    }
  };

  const start = async () => {
    if (!loaded.value) await load();
  };

  const upsert = (server: Server) => {
    servers.value = byId.value[server.id]
      ? servers.value.map((item) =>
          item.id === server.id ? { ...item, ...server } : item,
        )
      : [...servers.value, server];
  };

  const remove = (id: string) => {
    servers.value = servers.value.filter((server) => server.id !== id);
  };

  return { servers, byId, loading, loaded, error, load, start, upsert, remove };
});
