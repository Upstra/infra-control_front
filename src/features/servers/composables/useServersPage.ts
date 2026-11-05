import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useServerInventoryStore } from '../inventoryStore';
import { useVmwareLiveStore } from '@/features/vmware/liveStore';
import { useUpsLiveStore } from '@/features/ups/liveStore';
import { useRoomOptions } from '@/features/rooms/composables/useRoomOptions';
import { powerStateManager } from '@/services/powerStateManager';
import {
  filterServerRows,
  serverRow,
  serversSummary,
  sortServerRows,
  type ServerFilter,
} from '../domain/row';
import type { HostMetrics, ServerType } from '../types';

export const useServersPage = () => {
  const route = useRoute();
  const router = useRouter();
  const inventory = useServerInventoryStore();
  const vmware = useVmwareLiveStore();
  const upsLive = useUpsLiveStore();
  const { rooms, byId: roomsById, nameOf } = useRoomOptions();

  const query = ref('');
  const filter = ref<ServerFilter>('all');
  const type = ref<ServerType | null>(null);
  const roomId = ref<string | null>(null);

  onMounted(() => {
    inventory.start();
    vmware.start();
    upsLive.start();
  });

  const hostsByServer = computed(() =>
    Object.fromEntries(
      vmware.hosts
        .filter(
          (host): host is HostMetrics & { serverId: string } => !!host.serverId,
        )
        .map((host) => [host.serverId, host]),
    ),
  );

  const rows = computed(() =>
    sortServerRows(
      inventory.servers.map((server) =>
        serverRow(server, {
          hostsByServer: hostsByServer.value,
          upsById: upsLive.byId,
          upsStatus: upsLive.statusById,
          roomName: nameOf,
          inletWarnC: (id) => roomsById.value[id]?.inletWarnC,
          busy: (id) => powerStateManager.isInOperation(id),
        }),
      ),
    ),
  );
  const visibleRows = computed(() =>
    filterServerRows(rows.value, {
      query: query.value,
      filter: filter.value,
      type: type.value,
      roomId: roomId.value,
    }),
  );
  const summary = computed(() => serversSummary(rows.value));

  const routeId = computed(() =>
    typeof route.params.id === 'string' ? route.params.id : null,
  );
  const selectedId = computed(
    () => routeId.value ?? rows.value[0]?.server.id ?? null,
  );
  const selectedRow = computed(
    () => rows.value.find((row) => row.server.id === selectedId.value) ?? null,
  );

  const select = (id: string) => router.replace(`/servers/${id}`);

  watch(
    () => [routeId.value, inventory.loaded, inventory.servers.length] as const,
    ([id, loaded]) => {
      if (loaded && id && !inventory.byId[id]) router.replace('/servers');
    },
  );

  const resetFilters = () => {
    query.value = '';
    filter.value = 'all';
    type.value = null;
    roomId.value = null;
  };

  return {
    inventory,
    rooms,
    roomsById,
    nameOf,
    query,
    filter,
    type,
    roomId,
    rows,
    visibleRows,
    summary,
    selectedId,
    selectedRow,
    select,
    resetFilters,
  };
};
