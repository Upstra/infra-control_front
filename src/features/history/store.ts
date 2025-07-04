import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { historyApi } from './api';
import type { HistoryEvent, HistoryFilter } from './types';

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

  const fetchHistory = async (page = 1, limit = 10) => {
    loading.value = true;
    try {
      const data = await historyApi.getList(page, limit, filters);
      events.value = data.items;
      totalItems.value = data.totalItems;
      totalPages.value = data.totalPages;
      currentPage.value = data.currentPage;
      return data;
    } finally {
      loading.value = false;
    }
  };

  const setFilters = (f: Partial<HistoryFilter>) => {
    Object.assign(filters, f);
  };

  const resetFilters = () => {
    Object.assign(filters, DEFAULT_FILTERS);
  };
  return {
    events,
    loading,
    totalItems,
    totalPages,
    currentPage,
    filters,
    fetchHistory,
    setFilters,
    resetFilters,
  };
});
