import type { HealthState } from '@/shared/components/pulse';
import type { BatteryStatus } from '@/features/ups/types';
import type { HostMetrics, Server } from '../types';

export const CPU_WARN = 90;
export const DEFAULT_INLET_WARN_C = 30;

export type ServerHealthState = HealthState | 'busy';

export type ServerReason =
  | { kind: 'on_battery'; ups: string }
  | { kind: 'psu_missing'; missing: number }
  | { kind: 'inlet'; value: number }
  | { kind: 'hardware'; health: string }
  | { kind: 'cpu'; value: number }
  | { kind: 'disconnected' }
  | { kind: 'powered_off' }
  | { kind: 'no_metrics' }
  | { kind: 'power_action' };

export interface ServerHealthInput {
  server: Pick<Server, 'type' | 'state' | 'hardware'>;
  host: HostMetrics | null;
  upsStatus: BatteryStatus | null;
  upsName: string | null;
  inletWarnC: number | null | undefined;
  busy: boolean;
}

export interface ServerHealth {
  state: ServerHealthState;
  reasons: ServerReason[];
}

const isPoweredOff = (host: HostMetrics) =>
  host.powerState !== null && host.powerState !== 'poweredOn';

const degradedReasons = ({
  server,
  host,
  upsStatus,
  upsName,
  inletWarnC,
}: ServerHealthInput) => {
  const reasons: ServerReason[] = [];
  if (upsStatus?.onBattery === true)
    reasons.push({ kind: 'on_battery', ups: upsName ?? '' });
  const hardware = server.hardware;
  if (hardware?.psu && hardware.psu.ok < hardware.psu.total) {
    reasons.push({
      kind: 'psu_missing',
      missing: hardware.psu.total - hardware.psu.ok,
    });
  }
  if (
    hardware?.inletC !== null &&
    hardware?.inletC !== undefined &&
    hardware.inletC > (inletWarnC ?? DEFAULT_INLET_WARN_C)
  ) {
    reasons.push({ kind: 'inlet', value: hardware.inletC });
  }
  if (hardware?.health === 'Warning' || hardware?.health === 'Critical') {
    reasons.push({ kind: 'hardware', health: hardware.health });
  }
  const cpu = host?.cpuPercent;
  if (cpu !== null && cpu !== undefined && cpu > CPU_WARN)
    reasons.push({ kind: 'cpu', value: cpu });
  return reasons;
};

export const serverHealth = (input: ServerHealthInput): ServerHealth => {
  const { server, host, busy } = input;
  if (busy) return { state: 'busy', reasons: [{ kind: 'power_action' }] };
  if (
    host &&
    host.connectionState !== null &&
    host.connectionState !== 'connected'
  ) {
    return { state: 'down', reasons: [{ kind: 'disconnected' }] };
  }
  if ((host && isPoweredOff(host)) || (!host && server.state === 'DOWN')) {
    return { state: 'down', reasons: [{ kind: 'powered_off' }] };
  }
  if (server.type === 'esxi' && !host)
    return { state: 'unknown', reasons: [{ kind: 'no_metrics' }] };
  const reasons = degradedReasons(input);
  return { state: reasons.length ? 'degraded' : 'up', reasons };
};

export const HEALTH_RANK: Record<ServerHealthState, number> = {
  down: 0,
  busy: 1,
  degraded: 2,
  unknown: 3,
  up: 4,
};

export const pillState = (state: ServerHealthState): HealthState =>
  state === 'busy' ? 'degraded' : state;
