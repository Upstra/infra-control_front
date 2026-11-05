import { describe, it, expect } from 'vitest';
import { powerBlock, powerConfirmation } from '../domain/power';

describe('power confirmation', () => {
  it('warns about running VMs before stopping an ESXi host', () => {
    expect(
      powerConfirmation({ type: 'esxi' }, 'stop', 3).needsMigrationWarning,
    ).toBe(true);
  });

  it('asks a simple confirmation when no VM runs', () => {
    expect(
      powerConfirmation({ type: 'esxi' }, 'reset', 0).needsMigrationWarning,
    ).toBe(false);
  });

  it('disables power control without an iLO', () => {
    expect(
      powerBlock({ ilo: null }, { iloUnreachable: false, busy: false }),
    ).toBe('no_ilo');
    expect(
      powerBlock(
        { ilo: { id: 'i' } as never },
        { iloUnreachable: true, busy: false },
      ),
    ).toBe('ilo_unreachable');
  });
});
