import { ref, watch, type Ref } from 'vue';
import { fetchServers } from '@/features/servers/api';
import type { Server } from '@/features/servers/types';

const SERVER_LIMIT = 100;

export const useUpsServers = (upsId: Ref<string | null>) => {
  const servers = ref<Server[]>([]);
  const loading = ref(false);

  const load = async () => {
    const id = upsId.value;
    if (!id) {
      servers.value = [];
      return;
    }
    loading.value = true;
    try {
      const { data } = await fetchServers({ page: 1, limit: SERVER_LIMIT });
      if (upsId.value !== id) return;
      servers.value = data.items
        .filter((server) => server.upsId === id)
        .sort((a, b) => a.priority - b.priority);
    } catch {
      servers.value = [];
    } finally {
      loading.value = false;
    }
  };

  watch(upsId, load, { immediate: true });

  return { servers, loading, reload: load };
};
