import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { historyApi } from './api';
import type {
  HistoryEvent,
  HistoryFilter,
  HistoryStatsResponse,
} from './types';

const DEFAULT_FILTERS: HistoryFilter = {
  entity: '',
  action: '',
  userId: '',
  from: '',
  to: '',
};

export const useHistoryStore = defineStore('history', () => {
  const events = ref<HistoryEvent[]>([]);
  const loading = ref(false);
  const totalItems = ref(0);
  const totalPages = ref(0);
  const currentPage = ref(1);
  const filters = reactive<HistoryFilter>({ ...DEFAULT_FILTERS });
  const availableEntityTypes = ref<string[]>([]);
  const hasMore = ref(true);
  const stats = ref<HistoryStatsResponse | null>(null);
  const statsLoading = ref(false);

  const fetchHistory = async (page = 1, limit = 10, append = false) => {
    loading.value = true;
    try {
      const data = await historyApi.getList(page, limit, filters);
      if (append) {
        events.value = [...events.value, ...data.items];
      } else {
        events.value = data.items;
      }
      totalItems.value = data.totalItems;
      totalPages.value = data.totalPages;
      currentPage.value = data.currentPage;
      hasMore.value = data.currentPage < data.totalPages;
      return data;
    } finally {
      loading.value = false;
    }
  };

  /** Get Available entity types for history filtering by calling API
   * @returns Promise resolving with an array of entity type strings.
   * @example
   * {
   * "entityTypes": [
   *  "user",
   *  "organization",
   *  "server",
   *  "network",
   * ]
   */
  const getAvailableEntityTypes = async (): Promise<string[]> => {
    const data = await historyApi.getAvailableEntityTypes();
    availableEntityTypes.value = data;
    return data;
  };

  /**
   * Set filters for the history list.
   * @param f Partial filters to update.
   */
  const setFilters = (f: Partial<HistoryFilter>) => {
    Object.assign(filters, f);
  };

  const resetFilters = () => {
    Object.assign(filters, DEFAULT_FILTERS);
  };

  const fetchStats = async () => {
    statsLoading.value = true;
    try {
      const data = await historyApi.getStats();
      stats.value = data;
      return data;
    } finally {
      statsLoading.value = false;
    }
  };

  return {
    events,
    loading,
    totalItems,
    totalPages,
    currentPage,
    filters,
    availableEntityTypes,
    hasMore,
    stats,
    statsLoading,
    fetchHistory,
    getAvailableEntityTypes,
    setFilters,
    resetFilters,
    fetchStats,
  };
});
