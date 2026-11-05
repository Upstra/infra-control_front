import { describe, it, expect } from 'vitest';
import {
  serversSummary,
  sortServerRows,
  type ServerRowModel,
} from '../domain/row';
import type { Server } from '../types';

const row = (
  name: string,
  state: ServerRowModel['health']['state'],
  hardware: Server['hardware'] = null,
): ServerRowModel => ({
  server: {
    id: name,
    name,
    ip: '',
    state: 'UP',
    type: 'esxi',
    priority: 1,
    roomId: 'r',
    groupId: '',
    adminUrl: '',
    login: '',
    hardware,
  } as Server,
  host: null,
  health: { state, reasons: [] },
  upsName: null,
  roomName: null,
  cpu: null,
});

describe('server rows', () => {
  it('sorts down servers first and healthy ones last', () => {
    const sorted = sortServerRows([
      row('a', 'up'),
      row('b', 'degraded'),
      row('c', 'down'),
    ]);
    expect(sorted.map((r) => r.server.name)).toEqual(['c', 'b', 'a']);
  });

  it('sums only the measured power and names the hottest server', () => {
    const summary = serversSummary([
      row('a', 'up', {
        inletC: 24,
        consumedW: 300,
        psu: null,
        health: 'OK',
        collectedAt: null,
      }),
      row('b', 'degraded', {
        inletC: 31,
        consumedW: null,
        psu: null,
        health: 'OK',
        collectedAt: null,
      }),
      row('c', 'up'),
    ]);
    expect(summary.powerW).toBe(300);
    expect(summary.withoutReading).toBe(2);
    expect(summary.hottest).toEqual({ name: 'b', inletC: 31 });
  });
});
