import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { dashboardApi } from './api';
import type { FullDashboardStatsDto } from './types';
import type { DashboardLayout, WidgetConfig } from './types/widget';
import { useApiCache } from '@/composables/useApiCache';

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<FullDashboardStatsDto | null>(null);
  const history = ref<Record<string, number> | null>(null);
  const loading = ref(false);
  const layouts = ref<DashboardLayout[]>([]);
  const activeLayoutId = ref<string | null>(null);

  const { withCache } = useApiCache<FullDashboardStatsDto>();
  const historyCache = useApiCache<Record<string, number>>();

  const activeLayout = computed(() => {
    return layouts.value.find(l => l.id === activeLayoutId.value);
  });

  const defaultLayout = computed(() => {
    return layouts.value.find(l => l.isDefault);
  });

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

  const createDefaultLayout = (): DashboardLayout => {
    return {
      id: 'default',
      name: 'Default Dashboard',
      columns: 12,
      rowHeight: 80,
      isDefault: true,
      widgets: [
        {
          id: 'stats-1',
          type: 'stats',
          title: 'Global Statistics',
          position: { x: 0, y: 0, w: 8, h: 3 },
          refreshInterval: 30000,
          visible: true,
        },
        {
          id: 'server-status-1',
          type: 'server-status',
          title: 'Server Status',
          position: { x: 8, y: 0, w: 4, h: 3 },
          refreshInterval: 30000,
          visible: true,
        },
        {
          id: 'quick-actions-1',
          type: 'quick-actions',
          title: 'Quick Actions',
          position: { x: 0, y: 3, w: 4, h: 3 },
          visible: true,
        },
      ],
    };
  };

  const loadLayouts = async () => {
    try {
      // TODO: Load from API
      const savedLayouts = localStorage.getItem('dashboard-layouts');
      if (savedLayouts) {
        layouts.value = JSON.parse(savedLayouts);
      } else {
        layouts.value = [createDefaultLayout()];
      }
      
      const savedActiveId = localStorage.getItem('active-dashboard-layout');
      activeLayoutId.value = savedActiveId || layouts.value[0]?.id;
    } catch (error) {
      console.error('Error loading layouts:', error);
      layouts.value = [createDefaultLayout()];
      activeLayoutId.value = layouts.value[0].id;
    }
  };

  const saveLayouts = () => {
    localStorage.setItem('dashboard-layouts', JSON.stringify(layouts.value));
    if (activeLayoutId.value) {
      localStorage.setItem('active-dashboard-layout', activeLayoutId.value);
    }
  };

  const addLayout = (layout: Omit<DashboardLayout, 'id'>) => {
    const newLayout: DashboardLayout = {
      ...layout,
      id: `layout-${Date.now()}`,
    };
    layouts.value.push(newLayout);
    saveLayouts();
    return newLayout;
  };

  const updateLayout = (layoutId: string, updates: Partial<DashboardLayout>) => {
    const index = layouts.value.findIndex(l => l.id === layoutId);
    if (index !== -1) {
      layouts.value[index] = { ...layouts.value[index], ...updates };
      saveLayouts();
    }
  };

  const deleteLayout = (layoutId: string) => {
    layouts.value = layouts.value.filter(l => l.id !== layoutId);
    if (activeLayoutId.value === layoutId) {
      activeLayoutId.value = layouts.value[0]?.id || null;
    }
    saveLayouts();
  };

  const setActiveLayout = (layoutId: string) => {
    if (layouts.value.find(l => l.id === layoutId)) {
      activeLayoutId.value = layoutId;
      saveLayouts();
    }
  };

  const addWidget = (layoutId: string, widget: WidgetConfig) => {
    const layout = layouts.value.find(l => l.id === layoutId);
    if (layout) {
      layout.widgets.push(widget);
      saveLayouts();
    }
  };

  const updateWidget = (layoutId: string, widgetId: string, updates: Partial<WidgetConfig>) => {
    const layout = layouts.value.find(l => l.id === layoutId);
    if (layout) {
      const widgetIndex = layout.widgets.findIndex(w => w.id === widgetId);
      if (widgetIndex !== -1) {
        layout.widgets[widgetIndex] = { ...layout.widgets[widgetIndex], ...updates };
        saveLayouts();
      }
    }
  };

  const removeWidget = (layoutId: string, widgetId: string) => {
    const layout = layouts.value.find(l => l.id === layoutId);
    if (layout) {
      layout.widgets = layout.widgets.filter(w => w.id !== widgetId);
      saveLayouts();
    }
  };

  const updateWidgetPositions = (layoutId: string, widgets: WidgetConfig[]) => {
    const layout = layouts.value.find(l => l.id === layoutId);
    if (layout) {
      layout.widgets = widgets;
      saveLayouts();
    }
  };

  return {
    stats,
    history,
    loading,
    layouts,
    activeLayoutId,
    activeLayout,
    defaultLayout,
    fetchStats,
    fetchHistory,
    loadLayouts,
    saveLayouts,
    addLayout,
    updateLayout,
    deleteLayout,
    setActiveLayout,
    addWidget,
    updateWidget,
    removeWidget,
    updateWidgetPositions,
  };
});
