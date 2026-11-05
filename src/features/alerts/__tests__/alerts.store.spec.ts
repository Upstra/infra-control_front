import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAlertsStore } from '../store';
import type { Alert } from '../types';

vi.mock('@/composables/useNamespaceSocket', () => ({
  useNamespaceSocket: () => ({ on: vi.fn(), emit: vi.fn() }),
}));

const alert = (overrides: Partial<Alert>): Alert => ({
  id: 'a1',
  dedupKey: 'ups:1:on_battery',
  type: 'ups_on_battery',
  severity: 'critical',
  status: 'open',
  resourceType: 'ups',
  resourceId: 'u1',
  resourceName: 'UPS-B2',
  title: 'UPS-B2 est sur batterie',
  message: '',
  details: null,
  openedAt: '2026-11-04T20:01:44.000Z',
  lastSeenAt: '2026-11-04T20:01:44.000Z',
  resolvedAt: null,
  acknowledgedAt: null,
  acknowledgedById: null,
  acknowledged: false,
  occurrences: 1,
  ...overrides,
});

describe('useAlertsStore', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('adds an opened alert, sorted by severity then date', () => {
    const store = useAlertsStore();
    store.apply(alert({ id: 'w', severity: 'warning' }));
    store.apply(alert({ id: 'c' }));
    expect(store.open.map((a) => a.id)).toEqual(['c', 'w']);
    expect(store.top?.id).toBe('c');
  });

  it('removes a resolved alert', () => {
    const store = useAlertsStore();
    store.apply(alert({ id: 'c' }));
    store.apply(alert({ id: 'c', status: 'resolved' }));
    expect(store.open).toHaveLength(0);
  });

  it('replaces the summary on alerts:summary', () => {
    const store = useAlertsStore();
    store.setSummary({
      open: { critical: 1, warning: 3, info: 0 },
      unacknowledgedCritical: 1,
    });
    expect(store.summary?.open.warning).toBe(3);
    expect(store.summary?.unacknowledgedCritical).toBe(1);
  });
});
