import { defineStore } from 'pinia';
import { ref } from 'vue';
import { dashboardApi } from './api';
import type { FullDashboardStatsDto } from './types';
import { useApiCache } from '@/composables/useApiCache';

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<FullDashboardStatsDto | null>(null);
  const history = ref<Record<string, number> | null>(null);
  const loading = ref(false);

  const { withCache } = useApiCache<FullDashboardStatsDto>();
  const historyCache = useApiCache<Record<string, number>>();

  const fetchStats = async (force = false) => {
    if (stats.value && !force) {
      return stats.value;
    }

    loading.value = true;
    try {
      stats.value = await withCache(
        'dashboard-stats',
        () => dashboardApi.getFullStats(),
        2 * 60 * 1000,
      );
      return stats.value;
    } finally {
      loading.value = false;
    }
  };

  const fetchHistory = async (entity: string, months = 6) => {
    const cacheKey = `dashboard-history-${entity}-${months}`;

    loading.value = true;
    try {
      history.value = await historyCache.withCache(
        cacheKey,
        () => dashboardApi.getHistoryStats(entity, months),
        5 * 60 * 1000,
      );
      return history.value;
    } finally {
      loading.value = false;
    }
  };

  return { stats, history, loading, fetchStats, fetchHistory };
});
