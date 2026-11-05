import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { checkUserPresence, fetchPresence } from './api';
import type { PresenceView } from './types';

export const usePresenceStore = defineStore('presence', () => {
  const statuses = ref<Record<string, boolean>>({});
  const views = ref<Record<string, PresenceView>>({});
  const isConnected = ref(false);
  const loading = ref(false);
  const loaded = ref(false);
  const error = ref<string | null>(null);

  const online = computed(() =>
    Object.values(views.value).filter((view) => view.online),
  );

  const apply = (view: PresenceView) => {
    statuses.value = { ...statuses.value, [view.userId]: view.online };
    if (view.online) {
      views.value = { ...views.value, [view.userId]: view };
    } else {
      const { [view.userId]: _gone, ...rest } = views.value;
      views.value = rest;
    }
  };

  const load = async () => {
    loading.value = true;
    try {
      const list = await fetchPresence();
      views.value = Object.fromEntries(list.map((view) => [view.userId, view]));
      list.forEach((view) => {
        statuses.value[view.userId] = view.online;
      });
      loaded.value = true;
      error.value = null;
    } catch (e: any) {
      error.value = e?.message ?? 'presence';
    } finally {
      loading.value = false;
    }
  };

  const fetchPresenceOf = async (userId: string) => {
    try {
      const { online: isOnline } = await checkUserPresence(userId);
      statuses.value[userId] = isOnline;
    } catch {
      statuses.value[userId] = false;
    }
  };

  return {
    statuses,
    views,
    online,
    isConnected,
    loading,
    loaded,
    error,
    apply,
    load,
    fetchPresence: fetchPresenceOf,
  };
});
