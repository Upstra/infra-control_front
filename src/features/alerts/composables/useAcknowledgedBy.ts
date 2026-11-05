import { computed, watch, type Ref } from 'vue';
import { useAlertsStore } from '../store';
import { lastAcknowledgement } from '../domain/resource';
import type { Alert } from '../types';

export const useAcknowledgedBy = (alert: Ref<Alert | null>) => {
  const store = useAlertsStore();

  watch(
    () => [alert.value?.id, alert.value?.acknowledged] as const,
    ([id, acknowledged]) => {
      if (id && acknowledged && !store.details[id]) {
        store.fetchDetails(id).catch(() => null);
      }
    },
    { immediate: true },
  );

  return computed<string | null>(() => {
    if (!alert.value?.acknowledged) return null;
    const details = store.details[alert.value.id];
    return lastAcknowledgement(details?.transitions)?.byUsername ?? null;
  });
};
