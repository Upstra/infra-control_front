import type { BatteryStatus, UpsResponseDto } from '../types';

export const makeStatus = (
  overrides: Partial<BatteryStatus> = {},
): BatteryStatus => ({
  upsId: 'u1',
  ip: '10.0.0.1',
  minutesRemaining: 25,
  hoursRemaining: 0.4,
  alertLevel: 'normal',
  statusLabel: 'Sur secteur',
  timestamp: '2026-11-04T20:00:00.000Z',
  onBattery: false,
  batteryPercentage: 100,
  loadPercent: 40,
  telemetry: null,
  ...overrides,
});

export const makeUps = (
  overrides: Partial<UpsResponseDto> = {},
): UpsResponseDto => ({
  id: 'u1',
  name: 'UPS-B2',
  ip: '10.0.0.1',
  roomId: 'room-b',
  serverCount: 2,
  grace_period_on: 120,
  grace_period_off: 600,
  nominalPowerW: null,
  effectiveNominalPowerW: 3000,
  nominalPowerSource: 'device',
  ...overrides,
});
