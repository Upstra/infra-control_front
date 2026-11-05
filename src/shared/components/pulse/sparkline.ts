import type { SeriesPoint } from './types';

export interface SparkGeometry {
  line: string;
  area: string;
  threshold: string | null;
}

export interface SparkBounds {
  width: number;
  height: number;
  min?: number;
  max?: number;
  threshold?: number | null;
}

const round = (n: number) => Math.round(n * 10) / 10;

export const sparkGeometry = (
  points: SeriesPoint[],
  { width, height, min, max, threshold }: SparkBounds,
): SparkGeometry | null => {
  if (points.length < 2) return null;
  const values = points.map(([, v]) => v);
  const lo = min ?? Math.min(...values);
  const hi = max ?? Math.max(...values);
  const span = hi - lo || 1;
  const t0 = points[0][0];
  const tSpan = points[points.length - 1][0] - t0 || 1;
  const x = (ts: number) => round(((ts - t0) / tSpan) * width);
  const y = (v: number) =>
    round(height - ((Math.min(hi, Math.max(lo, v)) - lo) / span) * height);
  const line = points
    .map(([ts, v], i) => `${i ? 'L' : 'M'}${x(ts)} ${y(v)}`)
    .join(' ');
  const area = `${line} L${width} ${height} L0 ${height} Z`;
  const thresholdPath =
    threshold === null || threshold === undefined
      ? null
      : `M0 ${y(threshold)}H${width}`;
  return { line, area, threshold: thresholdPath };
};
