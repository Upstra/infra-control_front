import { upsCondition, needsAttention } from './condition';
import type { BatteryStatus, UpsResponseDto } from '../types';

export interface FleetSummary {
  total: number;
  onBattery: number;
  watch: number;
  unreachable: number;
  minRuntime: number | null;
  powerW: number | null;
  capacityW: number | null;
  capacityPartial: boolean;
}

const sumKnown = (values: (number | null | undefined)[]) => {
  const known = values.filter((v): v is number => typeof v === 'number');
  return known.length ? known.reduce((sum, v) => sum + v, 0) : null;
};

export const fleetSummary = (
  units: UpsResponseDto[],
  statuses: Record<string, BatteryStatus>,
  unreachableIds: Set<string>,
): FleetSummary => {
  const conditions = units.map((ups) =>
    upsCondition(statuses[ups.id] ?? null, unreachableIds.has(ups.id)),
  );
  const runtimes = units
    .map((ups) => statuses[ups.id]?.minutesRemaining)
    .filter((v): v is number => typeof v === 'number');
  const capacities = units.map((ups) => ups.effectiveNominalPowerW);
  return {
    total: units.length,
    onBattery: conditions.filter((c) => c === 'on_battery').length,
    watch: conditions.filter(needsAttention).length,
    unreachable: units.filter(
      (ups) => unreachableIds.has(ups.id) || !statuses[ups.id],
    ).length,
    minRuntime: runtimes.length ? Math.min(...runtimes) : null,
    powerW: sumKnown(
      units.map((ups) => statuses[ups.id]?.telemetry?.load.realPowerW),
    ),
    capacityW: sumKnown(capacities),
    capacityPartial: capacities.some((v) => v === null || v === undefined),
  };
};
