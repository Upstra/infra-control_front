import { ref, onMounted, onUnmounted, watch } from 'vue';
import type { Widget } from '../types';
import type { WidgetData } from '../types/widget';

export function useWidget<T = any>(
  config: Widget,
  fetchData: () => Promise<T>,
) {
  const widgetData = ref<WidgetData<T>>({
    loading: true,
    error: null,
    data: null,
    lastUpdated: null,
  });

  let refreshInterval: number | null = null;

  const loadData = async () => {
    try {
      widgetData.value.loading = true;
      widgetData.value.error = null;

      const data = await fetchData();

      widgetData.value.data = data as any;
      widgetData.value.lastUpdated = new Date();
    } catch (error) {
      widgetData.value.error =
        error instanceof Error ? error.message : 'Unknown error';
    } finally {
      widgetData.value.loading = false;
    }
  };

  const refresh = () => {
    loadData();
  };

  const setupRefreshInterval = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    if (config.refreshInterval && config.refreshInterval > 0) {
      refreshInterval = window.setInterval(loadData, config.refreshInterval);
    }
  };

  onMounted(() => {
    loadData();
    setupRefreshInterval();
  });

  onUnmounted(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });

  watch(() => config.refreshInterval, setupRefreshInterval);

  return {
    widgetData,
    refresh,
    loadData,
  };
}
