import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue';
import { useI18n } from 'vue-i18n';
import { controlServerPower } from '../api';
import { powerStateManager } from '@/services/powerStateManager';
import { useAlertsStore } from '@/features/alerts/store';
import { useToast } from '@/shared/composables/useToast';
import {
  powerBlock,
  powerConfirmation,
  type PowerAction,
  type PowerConfirmation,
} from '../domain/power';
import type { Server } from '../types';

export const useServerPower = (
  server: MaybeRefOrGetter<Server>,
  runningVms: MaybeRefOrGetter<number>,
) => {
  const { t } = useI18n();
  const toast = useToast();
  const alerts = useAlertsStore();
  const pending = ref<PowerConfirmation | null>(null);

  const busy = computed(() =>
    powerStateManager.isInOperation(toValue(server).id),
  );
  const iloUnreachable = computed(() =>
    alerts.open.some(
      (alert) =>
        alert.type === 'server_ilo_unreachable' &&
        alert.resourceId === toValue(server).id,
    ),
  );
  const block = computed(() =>
    powerBlock(toValue(server), {
      iloUnreachable: iloUnreachable.value,
      busy: busy.value,
    }),
  );

  const run = async (action: PowerAction) => {
    const current = toValue(server);
    pending.value = null;
    powerStateManager.startOperation(
      current.id,
      'server',
      action === 'start' ? 'starting' : 'stopping',
    );
    try {
      await controlServerPower(current.id, action);
      toast.showSuccess(
        t(`serversPage.power.done_${action}`, { name: current.name }),
      );
    } catch {
      powerStateManager.endOperation(current.id);
      toast.showError(t('serversPage.power.failed'));
    }
  };

  const request = (action: PowerAction) => {
    if (block.value) return;
    if (action === 'start') {
      run('start');
      return;
    }
    pending.value = powerConfirmation(
      toValue(server),
      action,
      toValue(runningVms),
    );
  };

  const cancel = () => {
    pending.value = null;
  };

  return { block, busy, pending, request, run, cancel };
};
