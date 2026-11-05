import type { HealthState } from '@/shared/components/pulse';
import type { PowerOff, Vm, VmHealth } from '../types';

export const VM_HEALTH_RANK: Record<VmHealth, number> = {
  down: 0,
  unknown: 1,
  degraded: 2,
  up: 3,
};

export const vmHealth = (vm: Pick<Vm, 'health'>): VmHealth =>
  vm.health ?? 'unknown';

export const sortVmsBySeverity = <T extends Pick<Vm, 'health' | 'name'>>(
  vms: T[],
): T[] =>
  [...vms].sort(
    (a, b) =>
      VM_HEALTH_RANK[vmHealth(a)] - VM_HEALTH_RANK[vmHealth(b)] ||
      a.name.localeCompare(b.name),
  );

export const isIssue = (vm: Pick<Vm, 'health'>) => vmHealth(vm) !== 'up';

export interface LabelKey {
  key: string;
  params?: Record<string, string>;
}

export const powerOffLabel = (powerOff: PowerOff): LabelKey => {
  if (powerOff.cause === 'manual') {
    return powerOff.by
      ? { key: 'widgets.vms.cause.manual', params: { by: powerOff.by } }
      : { key: 'widgets.vms.cause.manual_unknown' };
  }
  return { key: `widgets.vms.cause.${powerOff.cause}` };
};

export const vmStateLabel = (vm: Pick<Vm, 'health' | 'powerOff'>): LabelKey =>
  vmHealth(vm) === 'down' && vm.powerOff
    ? powerOffLabel(vm.powerOff)
    : { key: `widgets.vms.state.${vmHealth(vm)}` };

export const vmHealthState = (vm: Pick<Vm, 'health'>): HealthState =>
  vmHealth(vm);
