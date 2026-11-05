import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUpsLiveStore } from '../liveStore';
import type { BatteryStatus } from '../types';

vi.mock('@/composables/useNamespaceSocket', () => ({
  useNamespaceSocket: () => ({ on: vi.fn(), emit: vi.fn() }),
}));

const status = (overrides: Partial<BatteryStatus> = {}): BatteryStatus => ({
  upsId: 'u1',
  ip: 'http://mock-ups:8000',
  minutesRemaining: 14,
  hoursRemaining: 0.23,
  alertLevel: 'warning',
  statusLabel: 'Sur batterie',
  timestamp: '2026-11-04T20:01:44.000Z',
  onBattery: true,
  batteryPercentage: 38,
  loadPercent: 61,
  telemetry: null,
  ...overrides,
});

describe('useUpsLiveStore', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('replaces the status on battery:status', () => {
    const store = useUpsLiveStore();
    store.applyStatus(status());
    store.applyStatus(status({ batteryPercentage: 30 }));
    expect(store.statusById.u1.batteryPercentage).toBe(30);
  });

  it('remembers when the outage started and forgets it back on mains', () => {
    const store = useUpsLiveStore();
    store.applyStatusChanged({
      upsId: 'u1',
      upsName: 'UPS-B2',
      previous: false,
      current: true,
      at: '2026-11-04T20:01:44.000Z',
      status: status(),
    });
    expect(store.outageStart('u1')).toBe('2026-11-04T20:01:44.000Z');
    store.applyStatus(status({ onBattery: false }));
    expect(store.outageStart('u1')).toBeNull();
  });

  it('prefers onBatterySince from the backend when present', () => {
    const store = useUpsLiveStore();
    store.applyStatus(status({ onBatterySince: '2026-11-04T19:59:00.000Z' }));
    expect(store.outageStart('u1')).toBe('2026-11-04T19:59:00.000Z');
  });
});
