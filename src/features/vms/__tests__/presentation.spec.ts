import { describe, it, expect } from 'vitest';
import { sortVmsBySeverity, vmStateLabel } from '../domain/presentation';

describe('vm presentation', () => {
  it('sorts down, then unknown, then degraded, then up', () => {
    const sorted = sortVmsBySeverity([
      { name: 'a', health: 'up' as const },
      { name: 'b', health: 'degraded' as const },
      { name: 'c', health: 'down' as const },
      { name: 'd', health: 'unknown' as const },
    ]);
    expect(sorted.map((vm) => vm.name)).toEqual(['c', 'd', 'b', 'a']);
  });

  it('labels a stopped VM by the cause of its power-off', () => {
    expect(
      vmStateLabel({
        health: 'down',
        powerOff: { at: '', cause: 'manual', by: 'VSPHERE.LOCAL\\jbidule' },
      }),
    ).toEqual({
      key: 'widgets.vms.cause.manual',
      params: { by: 'VSPHERE.LOCAL\\jbidule' },
    });
    expect(
      vmStateLabel({
        health: 'down',
        powerOff: { at: '', cause: 'ha', by: null },
      }).key,
    ).toBe('widgets.vms.cause.ha');
  });
});
