import { ref, toValue, watch, type MaybeRefOrGetter } from 'vue';
import { historyApi } from '@/features/history/api';
import { alertsApi } from '@/features/alerts/api';
import type { HistoryEvent } from '@/features/history/types';
import type { Alert } from '@/features/alerts/types';

const LIMIT = 30;

export const useServerHistory = (serverId: MaybeRefOrGetter<string>) => {
  const events = ref<HistoryEvent[]>([]);
  const alerts = ref<Alert[]>([]);
  const loading = ref(false);

  const load = async () => {
    const id = toValue(serverId);
    loading.value = true;
    const [history, alertPage] = await Promise.allSettled([
      historyApi.getList(1, LIMIT, { entity: 'server', entityId: id }),
      alertsApi.list({ resourceType: 'server', limit: 100 }),
    ]);
    if (toValue(serverId) !== id) return;
    events.value = history.status === 'fulfilled' ? history.value.items : [];
    alerts.value =
      alertPage.status === 'fulfilled'
        ? alertPage.value.items.filter((alert) => alert.resourceId === id)
        : [];
    loading.value = false;
  };

  watch(() => toValue(serverId), load, { immediate: true });

  return { events, alerts, loading, reload: load };
};
