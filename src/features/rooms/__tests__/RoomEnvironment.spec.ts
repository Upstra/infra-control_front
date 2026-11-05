import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import RoomEnvironment from '../components/RoomEnvironment.vue';
import { createTestI18n } from '@/test-utils/i18n';
import type { RoomEnvironment as Env } from '../types';

const env = (overrides: Partial<Env> = {}): Env => ({
  maxInletC: 31,
  maxInletServerId: 's1',
  totalConsumedW: 412,
  serversWithIlo: 2,
  serversReporting: 2,
  ...overrides,
});

const mountEnv = (environment: Env, inletWarnC: number | null = 30) =>
  mount(RoomEnvironment, {
    props: { environment, thresholds: { inletWarnC }, serverName: 'srv-b2-03' },
    global: { plugins: [createTestI18n()] },
  });

describe('RoomEnvironment', () => {
  it('turns the inlet tile to warning above the room threshold', () => {
    const tile = mountEnv(env({ maxInletC: 44 })).find('[data-kpi="inlet"]');
    expect(tile.attributes('data-state')).toBe('warning');
    expect(tile.text()).toContain('srv-b2-03');
  });

  it('shows an em dash when no server reports its inlet', () => {
    const tile = mountEnv(env({ maxInletC: null })).find('[data-kpi="inlet"]');
    expect(tile.find('[data-part="value"]').text()).toBe('—');
    expect(tile.attributes('data-state')).toBe('ok');
  });
});
