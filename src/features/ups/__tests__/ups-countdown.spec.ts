import { describe, it, expect } from 'vitest';
import { outageStartOf, shutdownCountdown } from '../domain/countdown';

const start = '2026-11-04T20:00:00.000Z';
const at = (seconds: number) => new Date(start).getTime() + seconds * 1000;

describe('UPS shutdown countdown', () => {
  it('counts down from the outage start plus the grace period', () => {
    const countdown = shutdownCountdown(start, 600, at(120));
    expect(countdown?.remainingSeconds).toBe(480);
    expect(countdown?.expired).toBe(false);
  });

  it('falls back to the alert opening without onBatterySince', () => {
    expect(outageStartOf({ alertOpenedAt: start })).toBe(start);
    expect(
      outageStartOf({
        onBatterySince: null,
        statusChangedAt: '2026-11-04T20:01:00.000Z',
        alertOpenedAt: start,
      }),
    ).toBe('2026-11-04T20:01:00.000Z');
  });

  it('reports the shutdown as running once the delay is over', () => {
    const countdown = shutdownCountdown(start, 600, at(700));
    expect(countdown?.remainingSeconds).toBe(0);
    expect(countdown?.expired).toBe(true);
  });
});
