import api from '@/services/api';
import type { MetricSeries, MetricSeriesParams } from './types';

export const metricsApi = {
  series: async ({
    id,
    ...params
  }: MetricSeriesParams): Promise<MetricSeries> => {
    const { data } = await api.get<MetricSeries>('/metrics/series', {
      params: id ? { ...params, id } : params,
    });
    return data;
  },
};
