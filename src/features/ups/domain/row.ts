import {
  CONDITION_HEALTH,
  CONDITION_RANK,
  needsAttention,
  showsReadings,
  upsCondition,
  type UpsCondition,
} from './condition';
import type { HealthState } from '@/shared/components/pulse';
import type { BatteryStatus, UpsResponseDto } from '../types';

export type UpsFilter = 'all' | 'issues';

export interface UpsRowModel {
  id: string;
  name: string;
  ip: string;
  roomId: string;
  model: string | null;
  condition: UpsCondition;
  health: HealthState;
  battery: number | null;
  minutesRemaining: number | null;
  loadPercent: number | null;
}

export const upsRowModel = (
  ups: UpsResponseDto,
  status: BatteryStatus | null,
  unreachable: boolean,
): UpsRowModel => {
  const condition = upsCondition(status, unreachable);
  const readings = showsReadings(condition) ? status : null;
  const device = readings?.telemetry?.device;
  return {
    id: ups.id,
    name: ups.name,
    ip: ups.ip,
    roomId: ups.roomId,
    model:
      [device?.manufacturer, device?.model].filter(Boolean).join(' ') || null,
    condition,
    health: CONDITION_HEALTH[condition],
    battery: readings?.batteryPercentage ?? null,
    minutesRemaining: readings?.minutesRemaining ?? null,
    loadPercent: readings?.loadPercent ?? null,
  };
};

export const sortRows = (rows: UpsRowModel[]) =>
  [...rows].sort(
    (a, b) =>
      CONDITION_RANK[a.condition] - CONDITION_RANK[b.condition] ||
      a.name.localeCompare(b.name),
  );

export const isProblem = (row: UpsRowModel) => row.condition !== 'nominal';

export const filterRows = (
  rows: UpsRowModel[],
  {
    query,
    filter,
    roomId,
  }: { query: string; filter: UpsFilter; roomId: string | null },
) => {
  const needle = query.trim().toLowerCase();
  return rows.filter(
    (row) =>
      (filter === 'all' || isProblem(row)) &&
      (!roomId || row.roomId === roomId) &&
      (!needle ||
        [row.name, row.ip, row.model ?? ''].some((field) =>
          field.toLowerCase().includes(needle),
        )),
  );
};

export interface ShortLabel {
  key: string;
  params?: Record<string, string | number>;
}

export const shortLabel = (
  row: UpsRowModel,
  minutes: string,
  percent: string,
): ShortLabel => {
  switch (row.condition) {
    case 'on_battery':
      return { key: 'upsPage.short.on_battery', params: { minutes } };
    case 'overload':
      return { key: 'upsPage.short.overload', params: { percent } };
    case 'replace':
      return { key: 'upsPage.short.replace' };
    case 'unreachable':
      return { key: 'upsPage.short.unreachable' };
    case 'pending':
      return { key: 'upsPage.short.pending' };
    case 'unknown_mains':
      return { key: 'upsPage.short.unknown_mains' };
    default:
      return { key: 'upsPage.short.mains', params: { percent } };
  }
};

export { needsAttention };
