import type { HealthState } from '@/shared/components/pulse';
import type { AlertSeverity } from '../types';

export const severityState: Record<AlertSeverity, HealthState> = {
  critical: 'down',
  warning: 'degraded',
  info: 'unknown',
};
