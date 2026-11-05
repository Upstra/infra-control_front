import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUpsLiveStore } from '../liveStore';
import { useUnreachableUps } from './useUnreachableUps';
import {
  filterRows,
  sortRows,
  upsRowModel,
  type UpsFilter,
} from '../domain/row';
import { fleetSummary } from '../domain/summary';

export const useUpsPage = () => {
  const route = useRoute();
  const router = useRouter();
  const live = useUpsLiveStore();
  const unreachable = useUnreachableUps();

  const query = ref('');
  const filter = ref<UpsFilter>('all');
  const roomId = ref<string | null>(null);

  onMounted(() => live.start());

  const rows = computed(() =>
    sortRows(
      live.units.map((ups) =>
        upsRowModel(
          ups,
          live.statusById[ups.id] ?? null,
          unreachable.value.has(ups.id),
        ),
      ),
    ),
  );
  const visibleRows = computed(() =>
    filterRows(rows.value, {
      query: query.value,
      filter: filter.value,
      roomId: roomId.value,
    }),
  );
  const summary = computed(() =>
    fleetSummary(live.units, live.statusById, unreachable.value),
  );

  const routeId = computed(() =>
    typeof route.params.id === 'string' ? route.params.id : null,
  );
  const selectedId = computed(() => routeId.value ?? rows.value[0]?.id ?? null);
  const selected = computed(() =>
    selectedId.value ? (live.byId[selectedId.value] ?? null) : null,
  );
  const selectedRow = computed(
    () => rows.value.find((row) => row.id === selectedId.value) ?? null,
  );

  const select = (id: string) => router.replace(`/ups/${id}`);

  watch(
    () => [routeId.value, live.loaded, live.units.length] as const,
    ([id, loaded]) => {
      if (loaded && id && !live.byId[id]) router.replace('/ups');
    },
  );

  const resetFilters = () => {
    query.value = '';
    filter.value = 'all';
    roomId.value = null;
  };

  return {
    live,
    unreachable,
    query,
    filter,
    roomId,
    rows,
    visibleRows,
    summary,
    selectedId,
    selected,
    selectedRow,
    select,
    resetFilters,
  };
};
