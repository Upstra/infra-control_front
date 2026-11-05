import { describe, it, expect } from 'vitest';
import { sortRows, upsRowModel } from '../domain/row';
import { makeStatus, makeUps } from './fixtures';

describe('UPS rows', () => {
  it('never shows a UPS on mains as on battery, even with 9 min left', () => {
    const row = upsRowModel(
      makeUps(),
      makeStatus({
        onBattery: false,
        minutesRemaining: 9,
        alertLevel: 'critical',
      }),
      false,
    );
    expect(row.condition).not.toBe('on_battery');
    expect(row.health).toBe('up');
  });

  it('keeps a null battery percentage null for the dashed ring', () => {
    const row = upsRowModel(
      makeUps(),
      makeStatus({ batteryPercentage: null }),
      false,
    );
    expect(row.battery).toBeNull();
  });

  it('sorts on battery, then to watch, then unreachable, then pending, then nominal', () => {
    const rows = sortRows([
      upsRowModel(makeUps({ id: 'n', name: 'N' }), makeStatus(), false),
      upsRowModel(makeUps({ id: 'p', name: 'P' }), null, false),
      upsRowModel(makeUps({ id: 'u', name: 'U' }), makeStatus(), true),
      upsRowModel(
        makeUps({ id: 'w', name: 'W' }),
        makeStatus({
          telemetry: { status: { replaceBattery: true } } as never,
        }),
        false,
      ),
      upsRowModel(
        makeUps({ id: 'b', name: 'B' }),
        makeStatus({ onBattery: true }),
        false,
      ),
    ]);
    expect(rows.map((row) => row.id)).toEqual(['b', 'w', 'u', 'p', 'n']);
  });
});
