import { ref } from 'vue';
import { useServerStore } from '@/features/servers/store';
import { fetchServersLight } from '@/features/servers/api';
import { fetchUvms } from '@/features/vms/api';
import type { GroupType } from '../types';

interface GroupResource {
  id: string;
  name: string;
  state: string;
  roomId?: string;
  serverName?: string;
  type: 'server' | 'vm';
  groupId?: string | null;
}

let serversLightCache: Pick<any, 'id' | 'name' | 'ip'>[] | null = null;
let serversLightCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export function useGroupResources() {
  const serverStore = useServerStore();
  const availableResources = ref<GroupResource[]>([]);
  const loadingResources = ref(false);

  const loadResources = async (
    type: GroupType,
    options?: {
      includeGroupId?: string;
      excludeWithGroup?: boolean;
      forceRefresh?: boolean;
    },
  ) => {
    loadingResources.value = true;
    try {
      if (type === 'SERVER') {
        if (options?.forceRefresh || serverStore.list.length === 0) {
          await serverStore.fetchServers(1, 100);
        }

        availableResources.value = serverStore.list.map((server) => ({
          id: server.id,
          name: server.name,
          state: server.state || 'unknown',
          roomId: server.roomId,
          type: 'server' as const,
          groupId: server.groupId,
        }));
      } else {
        const vmsResponse = await fetchUvms();
        const vms = Array.isArray(vmsResponse.items) ? vmsResponse.items : [];
        const now = Date.now();
        if (
          !serversLightCache ||
          now - serversLightCacheTime > CACHE_DURATION ||
          options?.forceRefresh
        ) {
          serversLightCache = await fetchServersLight();
          serversLightCacheTime = now;
        }

        availableResources.value = vms.map((vm: any) => {
          const server = vm.serverId
            ? serversLightCache?.find((s) => s.id === vm.serverId)
            : null;

          return {
            id: vm.id,
            name: vm.name,
            state: vm.state || 'unknown',
            serverName: server?.name || 'Unknown Server',
            type: 'vm' as const,
            groupId: vm.groupId,
          };
        });
      }

      if (options?.excludeWithGroup) {
        availableResources.value = availableResources.value.filter(
          (resource) =>
            !resource.groupId ||
            (options.includeGroupId &&
              resource.groupId === options.includeGroupId),
        );
      }
    } catch (error) {
      availableResources.value = [];
      throw error;
    } finally {
      loadingResources.value = false;
    }
  };

  const refreshResources = async (
    type: GroupType,
    options?: Parameters<typeof loadResources>[1],
  ) => {
    // Clear cache when refreshing
    if (type === 'VM') {
      serversLightCache = null;
    }
    await loadResources(type, { ...options, forceRefresh: true });
  };

  return {
    availableResources,
    loadingResources,
    loadResources,
    refreshResources,
  };
}
