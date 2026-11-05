import type { Alert } from '../types';

export const makeAlert = (overrides: Partial<Alert> = {}): Alert => ({
  id: 'a1',
  dedupKey: 'ups:u1:on_battery',
  type: 'ups_on_battery',
  severity: 'critical',
  status: 'open',
  resourceType: 'ups',
  resourceId: 'u1',
  resourceName: 'UPS-B2',
  title: 'UPS-B2 est sur batterie',
  message: 'Coupure secteur.',
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
