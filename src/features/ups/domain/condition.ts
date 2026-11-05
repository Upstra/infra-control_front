import type { HealthState } from '@/shared/components/pulse';
import type { BatteryStatus } from '../types';

export type UpsCondition =
  | 'on_battery'
  | 'overload'
  | 'replace'
  | 'unreachable'
  | 'pending'
  | 'unknown_mains'
  | 'charging'
  | 'nominal';

export const CONDITION_RANK: Record<UpsCondition, number> = {
  on_battery: 0,
  overload: 1,
  replace: 1,
  unreachable: 2,
  pending: 3,
  unknown_mains: 4,
  charging: 5,
  nominal: 6,
};

export const CONDITION_HEALTH: Record<UpsCondition, HealthState> = {
  on_battery: 'down',
  overload: 'degraded',
  replace: 'degraded',
  unreachable: 'down',
  pending: 'unknown',
  unknown_mains: 'unknown',
  charging: 'degraded',
  nominal: 'up',
};

export const upsCondition = (
  status: BatteryStatus | null | undefined,
  unreachable = false,
): UpsCondition => {
  if (unreachable) return 'unreachable';
  if (!status) return 'pending';
  if (status.onBattery === true) return 'on_battery';
  const flags = status.telemetry?.status;
  if (flags?.overload) return 'overload';
  if (flags?.replaceBattery) return 'replace';
  if (status.onBattery === null) return 'unknown_mains';
  if (flags?.charging && (status.batteryPercentage ?? 100) < 100) {
    return 'charging';
  }
  return 'nominal';
};

export const needsAttention = (condition: UpsCondition) =>
  condition === 'overload' || condition === 'replace';

export const showsReadings = (condition: UpsCondition) =>
  condition !== 'unreachable' && condition !== 'pending';
