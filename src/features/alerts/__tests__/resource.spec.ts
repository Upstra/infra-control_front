import { describe, it, expect } from 'vitest';
import { criticalBySection, resourceLink } from '../domain/resource';
import { makeAlert } from './fixtures';

describe('alert resources', () => {
  it('counts unacknowledged critical alerts per rail section', () => {
    const counts = criticalBySection([
      makeAlert({ id: '1' }),
      makeAlert({ id: '2', acknowledged: true }),
      makeAlert({ id: '3', type: 'host_disconnected', resourceType: 'server' }),
      makeAlert({ id: '4', severity: 'warning', type: 'server_psu_degraded' }),
    ]);
    expect(counts).toEqual({ '/ups': 1, '/servers': 1 });
  });

  it('links each resource type to its page', () => {
    expect(resourceLink({ resourceType: 'ups', resourceId: 'u1' })).toBe(
      '/ups/u1',
    );
    expect(resourceLink({ resourceType: 'room', resourceId: 'r1' })).toBe(
      '/rooms/r1',
    );
  });
});
