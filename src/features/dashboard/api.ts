import axios from '@/services/api';
import type {
  FullDashboardStatsDto,
  ServerCreationStat,
  UPSLoadStat,
  DashboardLayout,
  DashboardPreferences,
  DashboardTemplate,
  ActivityFeedResponse,
  AlertsResponse,
  ResourceUsageResponse,
  UserPresenceResponse,
  SystemHealthResponse,
  UpsStatusResponse,
  Widget,
} from './types';

/**
 * Build the authorization header for API requests using the token stored in
 * localStorage.
 *
 * @returns Axios request configuration containing the bearer token.
 */
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

// Helper to transform frontend widgets to backend format
const transformWidgetsForBackend = (widgets: Widget[]) => {
  return widgets.map((w) => ({
    id: w.id,
    type: w.type,
    title: w.title || `Widget ${w.type}`,
    position: {
      x: w.position.x,
      y: w.position.y,
      w: w.position.w,
      h: w.position.h,
    },
    settings: w.settings || {},
    refreshInterval: w.refreshInterval || 30000,
    visible: w.visible !== false,
  }));
};

export const dashboardApi = {
  /**
   * Retrieve complete dashboard statistics from the backend.
   *
   * @returns Promise resolving with overall infrastructure metrics.
   */
  getFullStats: async (): Promise<FullDashboardStatsDto> => {
    const { data } = await axios.get<FullDashboardStatsDto>(
      '/dashboard/full',
      getAuthHeaders(),
    );
    return data;
  },

  /**
   * Retrieve dashboard statistics (alias for getFullStats).
   *
   * @returns Promise resolving with overall infrastructure metrics.
   */
  getStats: async (): Promise<FullDashboardStatsDto> => {
    const { data } = await axios.get<FullDashboardStatsDto>(
      '/dashboard/full',
      getAuthHeaders(),
    );
    return data;
  },

  /**
   * Retrieve creation statistics for a specific entity over a period of
   * months.
   */
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

  /**
   * Fetch the server creation count for the last six months.
   * Currently this method returns mocked data.
   *
   * @returns Promise resolving with monthly creation stats.
   */
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

  /**
   * Fetch the UPS load history for the past 24 hours.
   * Currently this method returns mocked data.
   *
   * @returns Promise resolving with hourly UPS load stats.
   */
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

  // Layout Management
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
      // Transform widgets if present
      let payload: any = { ...layout };
      if (layout.widgets) {
        payload.widgets = transformWidgetsForBackend(layout.widgets);
      }

      console.log('layout :', payload);

      console.log('Updating layout with payload:', payload);
      const { data } = await axios.put(
        `/dashboard/layouts/${id}`,
        payload,
        getAuthHeaders(),
      );
      return data;
    } catch (error: any) {
      console.error('Update layout error:', {
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

  // Widget Data
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

  // Preferences
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

  // Templates
  getTemplates: async (): Promise<{ templates: DashboardTemplate[] }> => {
    const { data } = await axios.get('/dashboard/templates', getAuthHeaders());
    return data;
  },

  createLayoutFromTemplate: async (
    templateId: string,
    name: string,
  ): Promise<DashboardLayout> => {
    const { data } = await axios.post(
      '/dashboard/layouts/from-template',
      { templateId, name },
      getAuthHeaders(),
    );
    return data;
  },

  // Export
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
