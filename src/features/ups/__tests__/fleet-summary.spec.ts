import { describe, it, expect } from 'vitest';
import { fleetSummary } from '../domain/summary';
import { makeStatus, makeUps } from './fixtures';

describe('fleet summary', () => {
  it('flags a partial capacity as soon as one UPS has no nominal power', () => {
    const summary = fleetSummary(
      [
        makeUps({ id: 'a' }),
        makeUps({ id: 'b', effectiveNominalPowerW: null }),
      ],
      { a: makeStatus({ upsId: 'a' }), b: makeStatus({ upsId: 'b' }) },
      new Set(),
    );
    expect(summary.capacityPartial).toBe(true);
    expect(summary.capacityW).toBe(3000);
  });

  it('counts a UPS without battery status as unreachable and keeps the lowest runtime', () => {
    const summary = fleetSummary(
      [makeUps({ id: 'a' }), makeUps({ id: 'b' })],
      { a: makeStatus({ upsId: 'a', minutesRemaining: 9, onBattery: true }) },
      new Set(),
    );
    expect(summary.unreachable).toBe(1);
    expect(summary.onBattery).toBe(1);
    expect(summary.minRuntime).toBe(9);
  });
});
