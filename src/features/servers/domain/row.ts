import { HEALTH_RANK, serverHealth, type ServerHealth } from './health';
import type { BatteryStatus, UpsResponseDto } from '@/features/ups/types';
import type { HostMetrics, Server, ServerType } from '../types';

export type ServerFilter = 'all' | 'issues';

export interface ServerRowModel {
  server: Server;
  host: HostMetrics | null;
  health: ServerHealth;
  upsName: string | null;
  roomName: string | null;
  cpu: number | null;
}

export interface RowContext {
  hostsByServer: Record<string, HostMetrics>;
  upsById: Record<string, UpsResponseDto>;
  upsStatus: Record<string, BatteryStatus>;
  roomName: (id: string) => string | null;
  inletWarnC: (roomId: string) => number | null | undefined;
  busy: (id: string) => boolean;
}

export const serverRow = (server: Server, ctx: RowContext): ServerRowModel => {
  const host = ctx.hostsByServer[server.id] ?? null;
  const upsName = server.upsId
    ? (ctx.upsById[server.upsId]?.name ?? null)
    : null;
  return {
    server,
    host,
    upsName,
    roomName: ctx.roomName(server.roomId),
    cpu: host?.cpuPercent ?? null,
    health: serverHealth({
      server,
      host,
      upsStatus: server.upsId ? (ctx.upsStatus[server.upsId] ?? null) : null,
      upsName,
      inletWarnC: ctx.inletWarnC(server.roomId),
      busy: ctx.busy(server.id),
    }),
  };
};

export const sortServerRows = (rows: ServerRowModel[]) =>
  [...rows].sort(
    (a, b) =>
      HEALTH_RANK[a.health.state] - HEALTH_RANK[b.health.state] ||
      a.server.priority - b.server.priority ||
      a.server.name.localeCompare(b.server.name),
  );

export const filterServerRows = (
  rows: ServerRowModel[],
  {
    query,
    filter,
    type,
    roomId,
  }: {
    query: string;
    filter: ServerFilter;
    type: ServerType | null;
    roomId: string | null;
  },
) => {
  const needle = query.trim().toLowerCase();
  return rows.filter(
    (row) =>
      (filter === 'all' || row.health.state !== 'up') &&
      (!type || row.server.type === type) &&
      (!roomId || row.server.roomId === roomId) &&
      (!needle ||
        [
          row.server.name,
          row.server.ip,
          row.roomName ?? '',
          row.upsName ?? '',
        ].some((field) => field.toLowerCase().includes(needle))),
  );
};

export interface ServersSummary {
  total: number;
  esxi: number;
  vcenter: number;
  on: number;
  watch: number;
  down: number;
  powerW: number | null;
  withoutReading: number;
  hottest: { name: string; inletC: number } | null;
}

export const serversSummary = (rows: ServerRowModel[]): ServersSummary => {
  const watts = rows
    .map((row) => row.server.hardware?.consumedW)
    .filter((v): v is number => typeof v === 'number');
  const hottest = rows.reduce<ServersSummary['hottest']>((best, row) => {
    const inlet = row.server.hardware?.inletC;
    if (inlet === null || inlet === undefined) return best;
    return !best || inlet > best.inletC
      ? { name: row.server.name, inletC: inlet }
      : best;
  }, null);
  return {
    total: rows.length,
    esxi: rows.filter((row) => row.server.type === 'esxi').length,
    vcenter: rows.filter((row) => row.server.type === 'vcenter').length,
    on: rows.filter(
      (row) => row.health.state === 'up' || row.health.state === 'degraded',
    ).length,
    watch: rows.filter((row) => row.health.state === 'degraded').length,
    down: rows.filter((row) => row.health.state === 'down').length,
    powerW: watts.length ? watts.reduce((sum, v) => sum + v, 0) : null,
    withoutReading: rows.length - watts.length,
    hottest,
  };
};
