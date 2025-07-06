import api from '@/services/api';
import type {
  HistoryListResponseDto,
  HistoryFilter,
  HistoryStatsResponse,
} from './types';

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

const sanitizeFilters = (filters: HistoryFilter) => {
  const cleaned = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => {
      if (Array.isArray(v)) return v.length > 0;
      return v !== undefined && v !== '';
    }),
  );

  if (cleaned.entity && Array.isArray(cleaned.entity)) {
    cleaned.entity = cleaned.entity.join(',');
  }
  if (cleaned.entities) {
    cleaned.entities = cleaned.entities.join(',');
  }

  if (cleaned.action && Array.isArray(cleaned.action)) {
    cleaned.action = cleaned.action.join(',');
  }
  if (cleaned.actions) {
    cleaned.actions = cleaned.actions.join(',');
  }

  return cleaned;
};

export const historyApi = {
  getList: async (
    page = 1,
    limit = 10,
    filters: HistoryFilter = {},
  ): Promise<HistoryListResponseDto> => {
    const params = { page, limit, ...sanitizeFilters(filters) };
    const { data } = await api.get<HistoryListResponseDto>('/history', {
      params,
      ...getAuthHeaders(),
    });
    return data;
  },

  /** Get Available entity types for history filtering
   * @returns Promise resolving with an array of entity type strings.
   * @example
   * {
   * "entityTypes": [
   *  "user",
   * "organization",
   */
  getAvailableEntityTypes: async (): Promise<string[]> => {
    const { data } = await api.get<{ entityTypes: string[] }>(
      '/history/entity-types',
      {
        ...getAuthHeaders(),
      },
    );
    return data.entityTypes;
  },

  getStats: async (): Promise<HistoryStatsResponse> => {
    const { data } = await api.get<HistoryStatsResponse>('/history/stats', {
      ...getAuthHeaders(),
    });
    return data;
  },
};
