import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { fetchVms } from '@/features/vms/api';
import { fetchHostsMetrics } from '@/features/servers/api';
import { useNamespaceSocket } from '@/composables/useNamespaceSocket';
import {
  applyPowerOff,
  indexByMoid,
  mergeHostDiff,
  mergeVmDiff,
} from './domain/telemetry';
import type { HostMetrics } from '@/features/servers/types';
import type { Vm, VmPoweredOffEvent } from '@/features/vms/types';
import type { VmwareMetricsEvent } from './types';

const PAGE_LIMIT = 100;
const MAX_PAGES = 20;

const fetchAllVms = async (): Promise<Vm[]> => {
  const all: Vm[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const response = await fetchVms({
      page,
      limit: PAGE_LIMIT,
      includeMetrics: true,
    });
    all.push(...response.items);
    if (page >= response.totalPages) break;
  }
  return all;
};

export const useVmwareLiveStore = defineStore('vmwareLive', () => {
  const vmsByMoid = ref<Record<string, Vm>>({});
  const hostsByMoid = ref<Record<string, HostMetrics>>({});
  const loading = ref(false);
  const loaded = ref(false);
  const error = ref<string | null>(null);
  const stale = ref(false);
  const collectedAt = ref<string | null>(null);
  let live = false;

  const vms = computed(() => Object.values(vmsByMoid.value));
  const hosts = computed(() => Object.values(hostsByMoid.value));

  const applyMetrics = (event: VmwareMetricsEvent) => {
    vmsByMoid.value = mergeVmDiff(vmsByMoid.value, event.vms ?? []);
    hostsByMoid.value = mergeHostDiff(hostsByMoid.value, event.hosts ?? []);
    collectedAt.value = event.collectedAt;
  };

  const applyPoweredOff = (event: VmPoweredOffEvent) => {
    vmsByMoid.value = applyPowerOff(vmsByMoid.value, event);
  };

  const seedVms = (items: Vm[]) => {
    vmsByMoid.value = { ...vmsByMoid.value, ...indexByMoid(items) };
  };

  const load = async () => {
    loading.value = true;
    try {
      const [allVms, allHosts] = await Promise.all([
        fetchAllVms(),
        fetchHostsMetrics(),
      ]);
      vmsByMoid.value = indexByMoid(allVms);
      hostsByMoid.value = indexByMoid(allHosts);
      loaded.value = true;
      error.value = null;
      stale.value = false;
    } catch (e: any) {
      error.value = e?.message ?? 'vmware';
      stale.value = loaded.value;
    } finally {
      loading.value = false;
    }
  };

  const connectLive = () => {
    if (live) return;
    live = true;
    const { on } = useNamespaceSocket('/vmware');
    on('vmware:metrics', applyMetrics);
    on('vmware:vm-powered-off', applyPoweredOff);
  };

  const start = async () => {
    connectLive();
    if (!loaded.value) await load();
  };

  return {
    vmsByMoid,
    hostsByMoid,
    vms,
    hosts,
    loading,
    loaded,
    error,
    stale,
    collectedAt,
    applyMetrics,
    applyPoweredOff,
    seedVms,
    load,
    start,
    connectLive,
  };
});
