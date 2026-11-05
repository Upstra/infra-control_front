import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { alertsApi } from './api';
import { applyAlert, sortAlerts } from './domain/alerts';
import { useNamespaceSocket } from '@/composables/useNamespaceSocket';
import type { Alert, AlertSummary } from './types';

const OPEN_LIMIT = 100;
const ALERT_EVENTS = [
  'alert:opened',
  'alert:updated',
  'alert:acknowledged',
  'alert:resolved',
] as const;

export const useAlertsStore = defineStore('alerts', () => {
  const summary = ref<AlertSummary | null>(null);
  const open = ref<Alert[]>([]);
  const details = ref<Record<string, Alert>>({});
  const loading = ref(false);
  const error = ref<string | null>(null);
  const stale = ref(false);
  let live = false;

  const byId = computed<Record<string, Alert>>(() =>
    Object.fromEntries(open.value.map((alert) => [alert.id, alert])),
  );
  const top = computed<Alert | null>(() => open.value[0] ?? null);
  const criticalOpen = computed(() =>
    open.value.filter((alert) => alert.severity === 'critical'),
  );

  const apply = (alert: Alert) => {
    open.value = applyAlert(open.value, alert);
    if (details.value[alert.id]) {
      details.value[alert.id] = {
        ...alert,
        transitions: details.value[alert.id].transitions,
      };
    }
  };

  const setSummary = (next: AlertSummary) => {
    summary.value = next;
  };

  const load = async () => {
    loading.value = true;
    try {
      const [nextSummary, page] = await Promise.all([
        alertsApi.summary(),
        alertsApi.list({ status: 'open', limit: OPEN_LIMIT }),
      ]);
      summary.value = nextSummary;
      open.value = sortAlerts(page.items);
      error.value = null;
      stale.value = false;
    } catch (e: any) {
      error.value = e?.message ?? 'alerts';
      stale.value = open.value.length > 0 || summary.value !== null;
    } finally {
      loading.value = false;
    }
  };

  const fetchDetails = async (id: string) => {
    const alert = await alertsApi.get(id);
    details.value[id] = alert;
    return alert;
  };

  const acknowledge = async (id: string) => {
    const alert = await alertsApi.acknowledge(id);
    apply(alert);
    return alert;
  };

  const unacknowledge = async (id: string) => {
    const alert = await alertsApi.unacknowledge(id);
    apply(alert);
    return alert;
  };

  const connectLive = () => {
    if (live) return;
    live = true;
    const { on } = useNamespaceSocket('/alerts');
    ALERT_EVENTS.forEach((event) => on(event, apply));
    on('alerts:summary', setSummary);
    on('connect', () => {
      if (summary.value) load();
    });
  };

  const start = async () => {
    connectLive();
    if (!summary.value) await load();
  };

  return {
    summary,
    open,
    details,
    loading,
    error,
    stale,
    byId,
    top,
    criticalOpen,
    apply,
    setSummary,
    load,
    start,
    fetchDetails,
    acknowledge,
    unacknowledge,
    connectLive,
  };
});
