import { describe, it, expect } from 'vitest';
import { formFor, toUpdatePayload, validateSettings } from '../domain/settings';
import { makeUps } from './fixtures';

describe('UPS settings', () => {
  it('moves the servers by default when the room changes', () => {
    const ups = makeUps();
    const form = { ...formFor(ups), roomId: 'room-c' };
    expect(toUpdatePayload(form, ups, 2).moveServers).toBe(true);
  });

  it('sends no move choice when no server is attached', () => {
    const ups = makeUps({ serverCount: 0 });
    const form = { ...formFor(ups), roomId: 'room-c' };
    expect(toUpdatePayload(form, ups, 0)).not.toHaveProperty('moveServers');
  });

  it('refuses an invalid address and accepts a NUT URL', () => {
    const ups = makeUps();
    expect(validateSettings({ ...formFor(ups), ip: '300.1.1' })).toBe(
      'ip_invalid',
    );
    expect(
      validateSettings({ ...formFor(ups), ip: 'http://mock-ups:8000' }),
    ).toBeNull();
  });
});
