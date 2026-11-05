import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue';
import { useI18n } from 'vue-i18n';
import { fetchVms } from '@/features/vms/api';
import { controlVmPower } from '@/features/vmware/api';
import { useVmwareLiveStore } from '@/features/vmware/liveStore';
import { useToast } from '@/shared/composables/useToast';
import { sortVmsBySeverity } from '@/features/vms/domain/presentation';
import type { Vm } from '@/features/vms/types';

export type VmAction = 'start' | 'restart' | 'stop';

const API_ACTION: Record<VmAction, 'on' | 'reset' | 'off'> = {
  start: 'on',
  restart: 'reset',
  stop: 'off',
};

export const useServerVms = (serverId: MaybeRefOrGetter<string>) => {
  const { t } = useI18n();
  const toast = useToast();
  const live = useVmwareLiveStore();
  const local = ref<Vm[]>([]);
  const loading = ref(false);
  const busy = ref<Record<string, VmAction>>({});

  const load = async () => {
    const id = toValue(serverId);
    loading.value = true;
    try {
      const page = await fetchVms({
        serverId: id,
        includeMetrics: true,
        limit: 100,
      });
      if (toValue(serverId) !== id) return;
      local.value = page.items;
      live.seedVms(page.items);
    } catch {
      local.value = [];
    } finally {
      loading.value = false;
    }
  };

  watch(() => toValue(serverId), load, { immediate: true });

  const vms = computed(() =>
    sortVmsBySeverity(
      local.value.map((vm) => (vm.moid ? (live.vmsByMoid[vm.moid] ?? vm) : vm)),
    ),
  );
  const running = computed(
    () =>
      vms.value.filter(
        (vm) => vm.health !== 'down' && vm.metrics?.powerState !== 'poweredOff',
      ).length,
  );

  const act = async (vm: Vm, action: VmAction) => {
    if (!vm.moid || busy.value[vm.id]) return;
    busy.value = { ...busy.value, [vm.id]: action };
    try {
      await controlVmPower(vm.moid, API_ACTION[action]);
      toast.showSuccess(t('serversPage.vms.done', { name: vm.name }));
      setTimeout(load, 3000);
    } catch {
      toast.showError(t('serversPage.vms.failed', { name: vm.name }));
    } finally {
      const { [vm.id]: _done, ...rest } = busy.value;
      busy.value = rest;
    }
  };

  return { vms, running, loading, busy, act, reload: load };
};
