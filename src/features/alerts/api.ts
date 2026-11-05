import api from '@/services/api';
import type {
  Alert,
  AlertListParams,
  AlertListResponse,
  AlertSummary,
} from './types';

export const alertsApi = {
  list: async (params: AlertListParams = {}): Promise<AlertListResponse> => {
    const { data } = await api.get<AlertListResponse>('/alerts', { params });
    return data;
  },

  summary: async (): Promise<AlertSummary> => {
    const { data } = await api.get<AlertSummary>('/alerts/summary');
    return data;
  },

  get: async (id: string): Promise<Alert> => {
    const { data } = await api.get<Alert>(`/alerts/${id}`);
    return data;
  },

  acknowledge: async (id: string): Promise<Alert> => {
    const { data } = await api.post<Alert>(`/alerts/${id}/acknowledge`);
    return data;
  },

  unacknowledge: async (id: string): Promise<Alert> => {
    const { data } = await api.post<Alert>(`/alerts/${id}/unacknowledge`);
    return data;
  },
};
