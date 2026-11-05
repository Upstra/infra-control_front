import { defineStore } from 'pinia';
import { ref } from 'vue';
import { eventsApi } from './api';
import { appendPage, mergeHead } from './domain';
import { useNamespaceSocket } from '@/composables/useNamespaceSocket';
import type { FeedItem } from './types';

const PAGE_SIZE = 30;
const ALERT_EVENTS = [
  'alert:opened',
  'alert:updated',
  'alert:acknowledged',
  'alert:resolved',
];

export const useFeedStore = defineStore('feed', () => {
  const items = ref<FeedItem[]>([]);
  const nextCursor = ref<string | null>(null);
  const loading = ref(false);
  const loaded = ref(false);
  const error = ref<string | null>(null);
  const stale = ref(false);
  let live = false;

  const fail = (e: any) => {
    error.value = e?.message ?? 'feed';
    stale.value = items.value.length > 0;
  };

  const load = async () => {
    loading.value = true;
    try {
      const page = await eventsApi.feed({ limit: PAGE_SIZE });
      items.value = page.items;
      nextCursor.value = page.nextCursor;
      loaded.value = true;
      error.value = null;
      stale.value = false;
    } catch (e) {
      fail(e);
    } finally {
      loading.value = false;
    }
  };

  const loadMore = async () => {
    if (!nextCursor.value || loading.value) return;
    loading.value = true;
    try {
      const page = await eventsApi.feed({
        limit: PAGE_SIZE,
        cursor: nextCursor.value,
      });
      items.value = appendPage(items.value, page.items);
      nextCursor.value = page.nextCursor;
    } catch (e) {
      fail(e);
    } finally {
      loading.value = false;
    }
  };

  const refreshHead = async () => {
    try {
      const page = await eventsApi.feed({ limit: PAGE_SIZE });
      items.value = mergeHead(items.value, page.items);
      if (!loaded.value) nextCursor.value = page.nextCursor;
      loaded.value = true;
      stale.value = false;
    } catch (e) {
      fail(e);
    }
  };

  const connectLive = () => {
    if (live) return;
    live = true;
    const { on } = useNamespaceSocket('/alerts');
    ALERT_EVENTS.forEach((event) => on(event, refreshHead));
  };

  const start = async () => {
    connectLive();
    if (!loaded.value) await load();
  };

  return {
    items,
    nextCursor,
    loading,
    loaded,
    error,
    stale,
    load,
    loadMore,
    refreshHead,
    start,
    connectLive,
  };
});
