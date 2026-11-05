import type { FullDashboardStatsDto } from '../types';

export const DEFAULT_INLET_WARN_C = 30;

export interface KpiInputs {
  stats: FullDashboardStatsDto;
  inletWarnC: number | null | undefined;
  roomName: string | null;
}

export const vmTotals = (stats: FullDashboardStatsDto) => {
  const byHealth = stats.vmsByHealth;
  if (!byHealth) return null;
  const total =
    byHealth.up + byHealth.degraded + byHealth.down + byHealth.unknown;
  return {
    running: byHealth.up + byHealth.degraded,
    total,
    down: byHealth.down,
    issues: byHealth.degraded + byHealth.unknown,
  };
};

export const inletThreshold = (inletWarnC: number | null | undefined) =>
  inletWarnC ?? DEFAULT_INLET_WARN_C;

export const isInletHot = ({ stats, inletWarnC }: KpiInputs) =>
  stats.maxInletC !== null &&
  stats.maxInletC !== undefined &&
  stats.maxInletC > inletThreshold(inletWarnC);

export const powerShare = (stats: FullDashboardStatsDto): number | null => {
  const { totalPowerW, totalCapacityW } = stats;
  if (totalPowerW === null || totalPowerW === undefined) return null;
  if (!totalCapacityW) return null;
  return Math.round((totalPowerW / totalCapacityW) * 100);
};
