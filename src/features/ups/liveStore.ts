import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { upsApi } from './api';
import { applyStatusChange, clearEndedOutage } from './domain/outage';
import { useNamespaceSocket } from '@/composables/useNamespaceSocket';
import type {
  BatteryStatus,
  BatteryStatusChangedEvent,
  UpsResponseDto,
} from './types';

const LIST_LIMIT = 100;

export const useUpsLiveStore = defineStore('upsLive', () => {
  const units = ref<UpsResponseDto[]>([]);
  const statusById = ref<Record<string, BatteryStatus>>({});
  const outageStartById = ref<Record<string, string>>({});
  const loading = ref(false);
  const loaded = ref(false);
  const error = ref<string | null>(null);
  const stale = ref(false);
  let live = false;

  const byId = computed<Record<string, UpsResponseDto>>(() =>
    Object.fromEntries(units.value.map((ups) => [ups.id, ups])),
  );

  const applyStatus = (status: BatteryStatus) => {
    statusById.value = { ...statusById.value, [status.upsId]: status };
    outageStartById.value = clearEndedOutage(outageStartById.value, status);
  };

  const applyStatusChanged = (event: BatteryStatusChangedEvent) => {
    outageStartById.value = applyStatusChange(outageStartById.value, event);
    if (event.status) applyStatus({ ...event.status, upsId: event.upsId });
  };

  const seed = (items: UpsResponseDto[]) => {
    units.value = items;
    const statuses = { ...statusById.value };
    items.forEach((ups) => {
      if (ups.batteryStatus) statuses[ups.id] = ups.batteryStatus;
    });
    statusById.value = statuses;
  };

  const upsert = (ups: UpsResponseDto) => {
    const exists = units.value.some((item) => item.id === ups.id);
    units.value = exists
      ? units.value.map((item) => (item.id === ups.id ? ups : item))
      : [...units.value, ups];
    if (ups.batteryStatus) applyStatus(ups.batteryStatus);
  };

  const remove = (id: string) => {
    units.value = units.value.filter((item) => item.id !== id);
    const { [id]: _removed, ...rest } = statusById.value;
    statusById.value = rest;
  };

  const load = async () => {
    loading.value = true;
    try {
      const page = await upsApi.getAllPaginated(1, LIST_LIMIT);
      seed(page.items);
      loaded.value = true;
      error.value = null;
      stale.value = false;
    } catch (e: any) {
      error.value = e?.message ?? 'ups';
      stale.value = units.value.length > 0;
    } finally {
      loading.value = false;
    }
  };

  const connectLive = () => {
    if (live) return;
    live = true;
    const { on } = useNamespaceSocket('/ups');
    on('battery:status', applyStatus);
    on('battery:status-changed', applyStatusChanged);
  };

  const start = async () => {
    connectLive();
    if (!loaded.value) await load();
  };

  const outageStart = (upsId: string): string | null =>
    statusById.value[upsId]?.onBatterySince ??
    outageStartById.value[upsId] ??
    null;

  return {
    units,
    byId,
    statusById,
    outageStartById,
    loading,
    loaded,
    error,
    stale,
    applyStatus,
    applyStatusChanged,
    seed,
    upsert,
    remove,
    load,
    start,
    connectLive,
    outageStart,
  };
});
