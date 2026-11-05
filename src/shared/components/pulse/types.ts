export type HealthState = 'up' | 'degraded' | 'down' | 'unknown';

export type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'unknown';

export interface RingThresholds {
  danger: number;
  warning: number;
}

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
}

export type SeriesPoint = [number, number];
