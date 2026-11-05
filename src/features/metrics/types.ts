import type { SeriesPoint } from '@/shared/components/pulse';

export type MetricName =
  | 'total_power'
  | 'ups_real_power'
  | 'ups_battery_charge'
  | 'ups_runtime'
  | 'ups_load'
  | 'ups_input_voltage'
  | 'host_cpu'
  | 'server_inlet'
  | 'server_power';

export type MetricScope = 'total' | 'ups' | 'host' | 'server';
export type MetricRange = '1h' | '24h' | '7d';

export interface MetricSeriesParams {
  metric: MetricName;
  scope: MetricScope;
  id?: string | null;
  range: MetricRange;
}

export interface MetricSeries {
  metric: MetricName;
  unit: string;
  range: MetricRange;
  step: number;
  series: { label: string; points: SeriesPoint[] }[];
}

export const HISTORY_UNAVAILABLE = 'HISTORY_UNAVAILABLE';
