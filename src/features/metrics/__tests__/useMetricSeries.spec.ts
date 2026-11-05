import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import {
  useMetricSeries,
  clearMetricSeriesCache,
} from '../composables/useMetricSeries';
import { metricsApi } from '../api';
import type { MetricSeriesParams } from '../types';

vi.mock('../api', () => ({ metricsApi: { series: vi.fn() } }));

const params: MetricSeriesParams = {
  metric: 'total_power',
  scope: 'total',
  range: '1h',
};

const httpError = (status: number, data: unknown = {}) =>
  Object.assign(new Error('http'), { response: { status, data } });

describe('useMetricSeries', () => {
  beforeEach(() => {
    clearMetricSeriesCache();
    vi.mocked(metricsApi.series).mockReset();
  });

  it('reports unavailable on 503 HISTORY_UNAVAILABLE', async () => {
    vi.mocked(metricsApi.series).mockRejectedValue(
      httpError(503, { code: 'HISTORY_UNAVAILABLE' }),
    );
    const { state, data } = useMetricSeries(params);
    await flushPromises();
    expect(state.value).toBe('unavailable');
    expect(data.value).toBeNull();
  });

  it('serves a second call within 15 s from the cache', async () => {
    vi.mocked(metricsApi.series).mockResolvedValue({
      metric: 'total_power',
      unit: 'W',
      range: '1h',
      step: 15,
      series: [],
    });
    useMetricSeries(params);
    await flushPromises();
    const second = useMetricSeries(params);
    await flushPromises();
    expect(metricsApi.series).toHaveBeenCalledTimes(1);
    expect(second.state.value).toBe('ready');
  });

  it('reports a distinct error on 400', async () => {
    vi.mocked(metricsApi.series).mockRejectedValue(httpError(400));
    const { state } = useMetricSeries(params);
    await flushPromises();
    expect(state.value).toBe('error');
  });
});
