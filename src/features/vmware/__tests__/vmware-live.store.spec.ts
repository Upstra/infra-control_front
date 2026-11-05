import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useVmwareLiveStore } from '../liveStore';
import type { Vm, VmTelemetry } from '@/features/vms/types';

vi.mock('@/composables/useNamespaceSocket', () => ({
  useNamespaceSocket: () => ({ on: vi.fn(), emit: vi.fn() }),
}));

const vm = (moid: string): Vm => ({
  id: `id-${moid}`,
  name: moid,
  moid,
  state: 'UP',
  grace_period_on: 0,
  grace_period_off: 0,
  priority: 1,
  health: 'up',
  cpuPercent: 10,
});

const diff = (moid: string, overrides: Partial<VmTelemetry>): VmTelemetry =>
  ({
    moid,
    name: moid,
    health: 'up',
    cpuPercent: 10,
    ...overrides,
  }) as VmTelemetry;

describe('useVmwareLiveStore', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('only changes the VMs present in the diff, joined on moid', () => {
    const store = useVmwareLiveStore();
    store.seedVms([vm('vm-1'), vm('vm-2')]);
    store.applyMetrics({
      collectedAt: 'now',
      vms: [diff('vm-2', { health: 'degraded', cpuPercent: 94 })],
      hosts: [],
    });
    expect(store.vmsByMoid['vm-1'].cpuPercent).toBe(10);
    expect(store.vmsByMoid['vm-2'].health).toBe('degraded');
    expect(store.vmsByMoid['vm-2'].cpuPercent).toBe(94);
  });

  it('ignores VMs that Upstra does not manage', () => {
    const store = useVmwareLiveStore();
    store.seedVms([vm('vm-1')]);
    store.applyMetrics({
      collectedAt: 'now',
      vms: [diff('vm-9', {})],
      hosts: [],
    });
    expect(Object.keys(store.vmsByMoid)).toEqual(['vm-1']);
  });

  it('applies powerOff from vmware:vm-powered-off', () => {
    const store = useVmwareLiveStore();
    store.seedVms([vm('vm-1')]);
    store.applyPoweredOff({
      moid: 'vm-1',
      name: 'vm-1',
      hostMoid: 'host-33',
      powerOff: { at: '2026-11-04T20:05:10.000Z', cause: 'ha', by: null },
    });
    expect(store.vmsByMoid['vm-1'].health).toBe('down');
    expect(store.vmsByMoid['vm-1'].powerOff?.cause).toBe('ha');
  });
});
