import { ref, watch, type MaybeRefOrGetter, toValue } from 'vue';
import { metricsApi } from '../api';
import { HISTORY_UNAVAILABLE } from '../types';
import type { MetricSeries, MetricSeriesParams } from '../types';

export const CACHE_TTL_MS = 15_000;

export type SeriesState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'unavailable'
  | 'error';

interface CacheEntry {
  at: number;
  data: MetricSeries;
}

const cache = new Map<string, CacheEntry>();

const keyOf = ({ metric, scope, id, range }: MetricSeriesParams) =>
  [metric, scope, id ?? '', range].join('|');

const isUnavailable = (e: any) =>
  e?.response?.status === 503 &&
  (e.response.data?.code ?? HISTORY_UNAVAILABLE) === HISTORY_UNAVAILABLE;

export const clearMetricSeriesCache = () => cache.clear();

export const useMetricSeries = (
  params: MaybeRefOrGetter<MetricSeriesParams | null>,
) => {
  const data = ref<MetricSeries | null>(null);
  const state = ref<SeriesState>('idle');
  const error = ref<string | null>(null);

  const fetch = async (force = false) => {
    const current = toValue(params);
    if (!current) return;
    const key = keyOf(current);
    const hit = cache.get(key);
    if (!force && hit && Date.now() - hit.at < CACHE_TTL_MS) {
      data.value = hit.data;
      state.value = 'ready';
      return;
    }
    state.value = 'loading';
    try {
      const result = await metricsApi.series(current);
      cache.set(key, { at: Date.now(), data: result });
      if (keyOf(toValue(params) ?? current) !== key) return;
      data.value = result;
      state.value = 'ready';
      error.value = null;
    } catch (e: any) {
      data.value = null;
      state.value = isUnavailable(e) ? 'unavailable' : 'error';
      error.value = e?.response?.data?.message ?? e?.message ?? null;
    }
  };

  watch(
    () => toValue(params),
    () => fetch(),
    { immediate: true, deep: true },
  );

  return { data, state, error, refresh: () => fetch(true) };
};
