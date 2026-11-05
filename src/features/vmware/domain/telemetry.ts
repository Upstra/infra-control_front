import type { HostMetrics } from '@/features/servers/types';
import type { Vm, VmPoweredOffEvent, VmTelemetry } from '@/features/vms/types';
import type { HostTelemetry } from '../types';

export const indexByMoid = <T extends { moid?: string }>(
  items: T[],
): Record<string, T> =>
  Object.fromEntries(
    items
      .filter((item) => item.moid)
      .map((item) => [item.moid as string, item]),
  );

const mergeVm = (vm: Vm, diff: VmTelemetry): Vm => ({
  ...vm,
  health: diff.health,
  cpuPercent: diff.cpuPercent,
  uptimeSeconds: diff.uptimeSeconds,
  esxiHostMoid: diff.hostMoid ?? vm.esxiHostMoid,
  powerOff: diff.health === 'down' ? (vm.powerOff ?? null) : null,
  metrics: {
    ...vm.metrics,
    powerState: diff.powerState ?? vm.metrics?.powerState,
  },
});

export const mergeVmDiff = (
  vms: Record<string, Vm>,
  diffs: VmTelemetry[],
): Record<string, Vm> => {
  const next = { ...vms };
  diffs.forEach((diff) => {
    const current = next[diff.moid];
    if (current) next[diff.moid] = mergeVm(current, diff);
  });
  return next;
};

export const mergeHostDiff = (
  hosts: Record<string, HostMetrics>,
  diffs: HostTelemetry[],
): Record<string, HostMetrics> => {
  const next = { ...hosts };
  diffs.forEach((diff) => {
    const current = next[diff.moid];
    if (!current) return;
    next[diff.moid] = {
      ...current,
      name: diff.name ?? current.name,
      health: diff.health,
      connectionState: diff.connectionState,
      powerState: diff.powerState,
      maintenance: diff.maintenance,
      cpuPercent: diff.cpuPercent,
      memoryPercent: diff.memoryPercent,
      uptimeSeconds: diff.uptimeSeconds,
      metricsAt: diff.metricsAt,
    };
  });
  return next;
};

export const applyPowerOff = (
  vms: Record<string, Vm>,
  event: VmPoweredOffEvent,
): Record<string, Vm> => {
  const current = vms[event.moid];
  if (!current) return vms;
  return {
    ...vms,
    [event.moid]: { ...current, health: 'down', powerOff: event.powerOff },
  };
};
