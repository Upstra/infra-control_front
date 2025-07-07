import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { dashboardApi } from './api';
import type {
  FullDashboardStatsDto,
  DashboardLayout,
  Widget,
  DashboardPreferences,
  DashboardTemplate,
  ActivityFeedResponse,
  AlertsResponse,
  ResourceUsageResponse,
  UserPresenceResponse,
  SystemHealthResponse,
  UpsStatusResponse,
} from './types';
import { useApiCache } from '@/composables/useApiCache';
import { useToast } from '@/composables/useToast';

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<FullDashboardStatsDto | null>(null);
  const history = ref<Record<string, number> | null>(null);
  const loading = ref(false);
  const layouts = ref<DashboardLayout[]>([]);
  const activeLayoutId = ref<string | null>(null);
  const preferences = ref<DashboardPreferences | null>(null);
  const templates = ref<DashboardTemplate[]>([]);
  const widgetDataCache = ref<Record<string, any>>({});
  const { showError, showSuccess } = useToast();

  const { withCache } = useApiCache<FullDashboardStatsDto>();
  const historyCache = useApiCache<Record<string, number>>();

  const activeLayout = computed(() => {
    return layouts.value.find((l) => l.id === activeLayoutId.value);
  });

  const defaultLayout = computed(() => {
    return layouts.value.find((l) => l.isDefault);
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

  const createDefaultLayout = (): Omit<
    DashboardLayout,
    'id' | 'userId' | 'createdAt' | 'updatedAt'
  > => {
    return {
      name: 'Default Dashboard',
      columns: 12,
      rowHeight: 80,
      isDefault: true,
      widgets: [
        {
          id: crypto.randomUUID(),
          type: 'stats',
          title: 'Global Statistics',
          position: { x: 0, y: 0, w: 8, h: 3 },
          settings: {},
          refreshInterval: 30000,
          visible: true,
        },
        {
          id: crypto.randomUUID(),
          type: 'alerts',
          title: 'Alerts',
          position: { x: 8, y: 0, w: 4, h: 3 },
          settings: {},
          refreshInterval: 30000,
          visible: true,
        },
        {
          id: crypto.randomUUID(),
          type: 'resource-usage',
          title: 'Resource Usage',
          position: { x: 0, y: 3, w: 6, h: 4 },
          settings: {},
          refreshInterval: 60000,
          visible: true,
        },
        {
          id: crypto.randomUUID(),
          type: 'system-health',
          title: 'System Health',
          position: { x: 6, y: 3, w: 6, h: 4 },
          settings: {},
          refreshInterval: 60000,
          visible: true,
        },
      ],
    };
  };

  const loadLayouts = async () => {
    loading.value = true;
    try {
      const response = await dashboardApi.getLayouts();
      layouts.value = response.layouts;

      if (layouts.value.length === 0) {
        const newLayout = await dashboardApi.createLayout(
          createDefaultLayout(),
        );
        layouts.value = [newLayout];
      }

      if (preferences.value?.defaultLayoutId) {
        activeLayoutId.value = preferences.value.defaultLayoutId;
      } else {
        activeLayoutId.value = defaultLayout.value?.id || layouts.value[0]?.id;
      }
    } catch {
      showError('Failed to load dashboard layouts');
    } finally {
      loading.value = false;
    }
  };

  const loadPreferences = async () => {
    try {
      preferences.value = await dashboardApi.getPreferences();
    } catch {}
  };

  const updatePreferences = async (updates: Partial<DashboardPreferences>) => {
    try {
      preferences.value = await dashboardApi.updatePreferences(updates);
      showSuccess('Preferences updated');
    } catch {
      showError('Failed to update preferences');
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await dashboardApi.getTemplates();
      templates.value = response.templates;
    } catch {}
  };

  const addLayout = async (
    layout: Omit<DashboardLayout, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ) => {
    try {
      const newLayout = await dashboardApi.createLayout(layout);
      layouts.value.push(newLayout);
      showSuccess('Layout created');
      return newLayout;
    } catch {
      showError('Failed to create layout');
      throw new Error('Operation failed');
    }
  };

  const createLayoutFromTemplate = async (templateId: string, name: string) => {
    try {
      const newLayout = await dashboardApi.createLayoutFromTemplate(
        templateId,
        name,
      );
      layouts.value.push(newLayout);
      showSuccess('Layout created from template');
      return newLayout;
    } catch {
      showError('Failed to create layout from template');
      throw new Error('Operation failed');
    }
  };

  const updateLayout = async (
    layoutId: string,
    updates: Partial<DashboardLayout>,
  ) => {
    try {
      const updatedLayout = await dashboardApi.updateLayout(layoutId, updates);
      const index = layouts.value.findIndex((l) => l.id === layoutId);
      if (index !== -1) {
        layouts.value[index] = updatedLayout;
      }
      showSuccess('Layout updated');
    } catch {
      showError('Failed to update layout');
      throw new Error('Operation failed');
    }
  };

  const deleteLayout = async (layoutId: string) => {
    try {
      await dashboardApi.deleteLayout(layoutId);
      layouts.value = layouts.value.filter((l) => l.id !== layoutId);
      if (activeLayoutId.value === layoutId) {
        activeLayoutId.value = layouts.value[0]?.id || null;
      }
      showSuccess('Layout deleted');
    } catch {
      showError('Failed to delete layout');
      throw new Error('Operation failed');
    }
  };

  const setActiveLayout = async (layoutId: string) => {
    if (layouts.value.find((l) => l.id === layoutId)) {
      activeLayoutId.value = layoutId;
      if (layoutId !== preferences.value?.defaultLayoutId) {
        await updatePreferences({ defaultLayoutId: layoutId });
      }
    }
  };

  const setDefaultLayout = async (layoutId: string) => {
    try {
      await dashboardApi.setDefaultLayout(layoutId);
      const layout = layouts.value.find((l) => l.id === layoutId);
      if (layout) {
        layouts.value.forEach((l) => (l.isDefault = false));
        layout.isDefault = true;
      }
      showSuccess('Default layout updated');
    } catch {
      showError('Failed to set default layout');
      throw new Error('Operation failed');
    }
  };

  const findAvailablePosition = (
    widgets: Widget[],
    columns: number,
    widgetWidth: number,
    widgetHeight: number,
  ) => {
    const maxRows = Math.max(
      ...widgets.map((w) => w.position.y + w.position.h),
      0,
    );
    const grid = Array(maxRows + widgetHeight + 5)
      .fill(null)
      .map(() => Array(columns).fill(false));

    widgets.forEach((w) => {
      for (let y = w.position.y; y < w.position.y + w.position.h; y++) {
        for (let x = w.position.x; x < w.position.x + w.position.w; x++) {
          if (grid[y] && grid[y][x] !== undefined) {
            grid[y][x] = true;
          }
        }
      }
    });

    for (let y = 0; y < grid.length - widgetHeight + 1; y++) {
      for (let x = 0; x <= columns - widgetWidth; x++) {
        let canPlace = true;

        for (let dy = 0; dy < widgetHeight && canPlace; dy++) {
          for (let dx = 0; dx < widgetWidth && canPlace; dx++) {
            if (grid[y + dy] && grid[y + dy][x + dx]) {
              canPlace = false;
            }
          }
        }

        if (canPlace) {
          return { x, y };
        }
      }
    }

    return { x: 0, y: maxRows };
  };

  const addWidget = async (layoutId: string, widget: Widget) => {
    const layout = layouts.value.find((l) => l.id === layoutId);
    if (layout) {
      let position = widget.position;
      if (widget.position.x === 0 && widget.position.y === 0) {
        position = {
          ...widget.position,
          ...findAvailablePosition(
            layout.widgets,
            layout.columns,
            widget.position.w,
            widget.position.h,
          ),
        };
      }

      const completeWidget: Widget = {
        ...widget,
        position,
        title: widget.title || `Widget ${widget.type}`,
        settings: widget.settings || {},
        refreshInterval: widget.refreshInterval || 30000,
        visible: widget.visible !== false,
      };

      const updatedWidgets = [...layout.widgets, completeWidget];
      await updateLayout(layoutId, { widgets: updatedWidgets });

      const layoutIndex = layouts.value.findIndex((l) => l.id === layoutId);
      if (layoutIndex !== -1) {
        layouts.value[layoutIndex].widgets = updatedWidgets;
      }
    }
  };

  const updateWidget = async (
    layoutId: string,
    widgetId: string,
    updates: Partial<Widget>,
  ) => {
    const layout = layouts.value.find((l) => l.id === layoutId);
    if (layout) {
      const updatedWidgets = layout.widgets.map((w) =>
        w.id === widgetId ? { ...w, ...updates } : w,
      );
      await updateLayout(layoutId, { widgets: updatedWidgets });

      const layoutIndex = layouts.value.findIndex((l) => l.id === layoutId);
      if (layoutIndex !== -1) {
        layouts.value[layoutIndex].widgets = updatedWidgets;
      }
    }
  };

  const removeWidget = async (layoutId: string, widgetId: string) => {
    const layout = layouts.value.find((l) => l.id === layoutId);
    if (layout) {
      const updatedWidgets = layout.widgets.filter((w) => w.id !== widgetId);
      await updateLayout(layoutId, { widgets: updatedWidgets });

      const layoutIndex = layouts.value.findIndex((l) => l.id === layoutId);
      if (layoutIndex !== -1) {
        layouts.value[layoutIndex].widgets = updatedWidgets;
      }
    }
  };

  const updateWidgetPositions = async (layoutId: string, widgets: Widget[]) => {
    await updateLayout(layoutId, { widgets });

    const layoutIndex = layouts.value.findIndex((l) => l.id === layoutId);
    if (layoutIndex !== -1) {
      layouts.value[layoutIndex].widgets = widgets;
    }
  };

  const getActivityFeed = async (
    page = 1,
    limit = 20,
  ): Promise<ActivityFeedResponse> => {
    return await dashboardApi.getActivityFeed(page, limit);
  };

  const getAlerts = async (): Promise<AlertsResponse> => {
    return await dashboardApi.getAlerts();
  };

  const getResourceUsage = async (): Promise<ResourceUsageResponse> => {
    return await dashboardApi.getResourceUsage();
  };

  const getUserPresence = async (): Promise<UserPresenceResponse> => {
    return await dashboardApi.getUserPresence();
  };

  const getSystemHealth = async (): Promise<SystemHealthResponse> => {
    return await dashboardApi.getSystemHealth();
  };

  const getUpsStatus = async (): Promise<UpsStatusResponse> => {
    return await dashboardApi.getUpsStatus();
  };

  const exportWidgetData = async (
    widgetId: string,
    format: 'csv' | 'json' | 'xlsx',
    dateFrom?: string,
    dateTo?: string,
  ) => {
    try {
      const blob = await dashboardApi.exportWidgetData(
        widgetId,
        format,
        dateFrom,
        dateTo,
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `widget-${widgetId}-export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccess('Export completed');
    } catch {
      showError('Failed to export widget data');
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
    preferences,
    templates,
    widgetDataCache,
    fetchStats,
    fetchHistory,
    loadLayouts,
    loadPreferences,
    updatePreferences,
    loadTemplates,
    addLayout,
    createLayoutFromTemplate,
    updateLayout,
    deleteLayout,
    setActiveLayout,
    setDefaultLayout,
    addWidget,
    updateWidget,
    removeWidget,
    updateWidgetPositions,
    getActivityFeed,
    getAlerts,
    getResourceUsage,
    getUserPresence,
    getSystemHealth,
    getUpsStatus,
    exportWidgetData,
  };
});
