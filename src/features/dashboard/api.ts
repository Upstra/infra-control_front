import axios from '@/services/api';
import type {
  DashboardLayout,
  FullDashboardStatsDto,
  SystemHealthResponse,
  Widget,
} from './types';

export interface LayoutPayload {
  name?: string;
  widgets?: Widget[];
}

export const dashboardApi = {
  getFullStats: async (): Promise<FullDashboardStatsDto> => {
    const { data } = await axios.get<FullDashboardStatsDto>('/dashboard/full');
    return data;
  },

  getSystemHealth: async (): Promise<SystemHealthResponse> => {
    const { data } = await axios.get<SystemHealthResponse>(
      '/dashboard/widgets/system-health',
    );
    return data;
  },

  getLayouts: async (): Promise<DashboardLayout[]> => {
    const { data } = await axios.get<{ layouts: DashboardLayout[] }>(
      '/dashboard/layouts',
    );
    return data.layouts ?? [];
  },

  createLayout: async (payload: LayoutPayload): Promise<DashboardLayout> => {
    const { data } = await axios.post<DashboardLayout>('/dashboard/layouts', {
      columns: 12,
      widgets: [],
      ...payload,
    });
    return data;
  },

  updateLayout: async (
    id: string,
    payload: LayoutPayload,
  ): Promise<DashboardLayout> => {
    const { data } = await axios.put<DashboardLayout>(
      `/dashboard/layouts/${id}`,
      payload,
    );
    return data;
  },

  deleteLayout: async (id: string): Promise<void> => {
    await axios.delete(`/dashboard/layouts/${id}`);
  },

  setDefaultLayout: async (id: string): Promise<void> => {
    await axios.post(`/dashboard/layouts/${id}/default`, {});
  },
};
