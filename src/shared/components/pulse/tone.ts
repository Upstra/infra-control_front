import type { RingThresholds, Tone } from './types';

export const DEFAULT_RING_THRESHOLDS: RingThresholds = {
  danger: 40,
  warning: 60,
};

export const ringTone = (
  value: number | null | undefined,
  thresholds: RingThresholds = DEFAULT_RING_THRESHOLDS,
): Tone => {
  if (value === null || value === undefined) return 'unknown';
  if (value < thresholds.danger) return 'danger';
  if (value < thresholds.warning) return 'warning';
  return 'success';
};

export const toneColor: Record<Tone, string> = {
  primary: 'rgb(var(--c-primary-hover))',
  success: 'rgb(var(--c-success))',
  warning: 'rgb(var(--c-warning))',
  danger: 'rgb(var(--c-danger))',
  unknown: 'rgb(var(--c-status-unknown))',
};

export const toneTextClass: Record<Tone, string> = {
  primary: 'text-primary-text',
  success: 'text-success-text',
  warning: 'text-warning-text',
  danger: 'text-danger-text',
  unknown: 'text-status-unknown',
};
