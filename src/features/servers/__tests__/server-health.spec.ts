import { describe, it, expect } from 'vitest';
import { serverHealth, type ServerHealthInput } from '../domain/health';
import type { HostMetrics } from '../types';

const host = (overrides: Partial<HostMetrics> = {}): HostMetrics => ({
  moid: 'host-33',
  name: 'esx-03',
  serverId: 's1',
  upsId: 'u1',
  health: 'up',
  connectionState: 'connected',
  powerState: 'poweredOn',
  maintenance: false,
  cpuPercent: 40,
  memoryPercent: 50,
  uptimeSeconds: 100,
  metricsAt: null,
  ...overrides,
});

const input = (
  overrides: Partial<ServerHealthInput> = {},
): ServerHealthInput => ({
  server: { type: 'esxi', state: 'UP', hardware: null },
  host: host(),
  upsStatus: null,
  upsName: 'UPS-B2',
  inletWarnC: 30,
  busy: false,
  ...overrides,
});

describe('serverHealth', () => {
  it('is degraded when its UPS runs on battery', () => {
    const health = serverHealth(
      input({ upsStatus: { onBattery: true } as never }),
    );
    expect(health.state).toBe('degraded');
    expect(health.reasons).toContainEqual({
      kind: 'on_battery',
      ups: 'UPS-B2',
    });
  });

  it('raises no hardware reason when there is no iLO (hardware null)', () => {
    expect(serverHealth(input()).state).toBe('up');
  });

  it('is down when the host is disconnected', () => {
    expect(
      serverHealth(input({ host: host({ connectionState: 'disconnected' }) }))
        .state,
    ).toBe('down');
  });
});
