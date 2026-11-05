import { describe, it, expect } from 'vitest';
import { upsCardModel } from '../domain/upsCard';
import { makeStatus, makeUps } from '@/features/ups/__tests__/fixtures';

describe('UPS card model', () => {
  it('shows the runtime in danger and in the pill while on battery', () => {
    const card = upsCardModel(
      makeUps(),
      makeStatus({ onBattery: true, minutesRemaining: 14 }),
    );
    expect(card.condition).toBe('on_battery');
    expect(card.runtime.emphasis).toBe('danger');
    expect(card.pillDetail).toBe('14 min');
  });

  it('drops the last reading of an unreachable UPS', () => {
    const card = upsCardModel(
      makeUps(),
      makeStatus({ batteryPercentage: 80 }),
      true,
    );
    expect(card.battery).toBeNull();
    expect(card.runtime.text).toBe('—');
  });
});
