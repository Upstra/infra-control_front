import axios from '@/services/api';
import { generateUUID } from '@/utils/uuid';
import type {
  FullDashboardStatsDto,
  ServerCreationStat,
  UPSLoadStat,
  DashboardLayout,
  DashboardPreferences,
  ActivityFeedResponse,
  AlertsResponse,
  ResourceUsageResponse,
  UserPresenceResponse,
  SystemHealthResponse,
  UpsStatusResponse,
  Widget,
} from './types';

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

const transformWidgetsForBackend = (widgets: Widget[]) => {
  return widgets.map((w) => {
    let title = w.title?.trim() || '';
    if (!title) {
      const typeLabels: Record<string, string> = {
        stats: 'Statistics',
        'activity-feed': 'Activity Feed',
        alerts: 'Alerts',
        'resource-usage': 'Resource Usage',
        'user-presence': 'User Presence',
        'system-health': 'System Health',
        'ups-status': 'UPS Status',
      };
      title = typeLabels[w.type] || `Widget ${w.type}`;
    }

    const isValidUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        w.id,
      );

    return {
      id: isValidUUID ? w.id : generateUUID(),
      type: w.type,
      title,
      position: {
        x: w.position.x,
        y: w.position.y,
        w: w.position.w,
        h: w.position.h,
      },
      settings: w.settings || {},
      refreshInterval: w.refreshInterval || 30000,
      visible: w.visible !== false,
    };
  });
};

export const dashboardApi = {
  getFullStats: async (): Promise<FullDashboardStatsDto> => {
    const { data } = await axios.get<FullDashboardStatsDto>(
      '/dashboard/full',
      getAuthHeaders(),
    );
    return data;
  },

  getStats: async (): Promise<FullDashboardStatsDto> => {
    const { data } = await axios.get<FullDashboardStatsDto>(
      '/dashboard/full',
      getAuthHeaders(),
    );
    return data;
  },

  getHistoryStats: async (
    entity: string,
    months = 6,
  ): Promise<Record<string, number>> => {
    const { data } = await axios.get<Record<string, number>>(
      '/dashboard/history',
      {
        params: { entity, months },
        ...getAuthHeaders(),
      },
    );
    return data;
  },

  getServerCreations: async (): Promise<ServerCreationStat[]> => {
    return [
      { month: 'jan', count: 3 },
      { month: 'feb', count: 5 },
      { month: 'mar', count: 2 },
      { month: 'apr', count: 6 },
      { month: 'may', count: 4 },
      { month: 'jun', count: 5 },
    ];
  },

  getUPSLoad: async (): Promise<UPSLoadStat[]> => {
    return [
      { hour: '00h', load: 20 },
      { hour: '04h', load: 35 },
      { hour: '08h', load: 50 },
      { hour: '12h', load: 60 },
      { hour: '16h', load: 45 },
      { hour: '20h', load: 30 },
    ];
  },

  getLayouts: async (): Promise<{ layouts: DashboardLayout[] }> => {
    const { data } = await axios.get('/dashboard/layouts', getAuthHeaders());
    return data;
  },

  createLayout: async (
    layout: Omit<DashboardLayout, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<DashboardLayout> => {
    const { data } = await axios.post(
      '/dashboard/layouts',
      layout,
      getAuthHeaders(),
    );
    return data;
  },

  updateLayout: async (
    id: string,
    layout: Partial<DashboardLayout>,
  ): Promise<DashboardLayout> => {
    try {
      const payload: any = {};

      if (layout.name !== undefined) {
        payload.name = layout.name;
      }

      if (layout.widgets) {
        payload.widgets = transformWidgetsForBackend(layout.widgets);
      }
      const { data } = await axios.put(
        `/dashboard/layouts/${id}`,
        payload,
        getAuthHeaders(),
      );
      return data;
    } catch (error: any) {
      console.error('Error updating layout:', {
        status: error.response?.status,
        data: error.response?.data,
        payload: layout,
      });
      throw error;
    }
  },

  deleteLayout: async (id: string): Promise<void> => {
    await axios.delete(`/dashboard/layouts/${id}`, getAuthHeaders());
  },

  setDefaultLayout: async (id: string): Promise<void> => {
    await axios.post(`/dashboard/layouts/${id}/default`, {}, getAuthHeaders());
  },

  getActivityFeed: async (
    page = 1,
    limit = 20,
  ): Promise<ActivityFeedResponse> => {
    const { data } = await axios.get('/dashboard/widgets/activity-feed', {
      params: { page, limit },
      ...getAuthHeaders(),
    });
    return data;
  },

  getAlerts: async (): Promise<AlertsResponse> => {
    const { data } = await axios.get(
      '/dashboard/widgets/alerts',
      getAuthHeaders(),
    );
    return data;
  },

  getResourceUsage: async (): Promise<ResourceUsageResponse> => {
    const { data } = await axios.get(
      '/dashboard/widgets/resource-usage',
      getAuthHeaders(),
    );
    return data;
  },

  getUserPresence: async (): Promise<UserPresenceResponse> => {
    const { data } = await axios.get(
      '/dashboard/widgets/user-presence',
      getAuthHeaders(),
    );
    return data;
  },

  getSystemHealth: async (): Promise<SystemHealthResponse> => {
    const { data } = await axios.get(
      '/dashboard/widgets/system-health',
      getAuthHeaders(),
    );
    return data;
  },

  getUpsStatus: async (): Promise<UpsStatusResponse> => {
    const { data } = await axios.get(
      '/dashboard/widgets/ups-status',
      getAuthHeaders(),
    );
    return data;
  },

  getPreferences: async (): Promise<DashboardPreferences> => {
    const { data } = await axios.get(
      '/dashboard/preferences',
      getAuthHeaders(),
    );
    return data;
  },

  updatePreferences: async (
    preferences: Partial<DashboardPreferences>,
  ): Promise<DashboardPreferences> => {
    const { data } = await axios.put(
      '/dashboard/preferences',
      preferences,
      getAuthHeaders(),
    );
    return data;
  },

  exportWidgetData: async (
    widgetId: string,
    format: 'csv' | 'json' | 'xlsx',
    dateFrom?: string,
    dateTo?: string,
  ): Promise<Blob> => {
    const { data } = await axios.get(`/dashboard/widgets/${widgetId}/export`, {
      params: { format, dateFrom, dateTo },
      responseType: 'blob',
      ...getAuthHeaders(),
    });
    return data;
  },
};
