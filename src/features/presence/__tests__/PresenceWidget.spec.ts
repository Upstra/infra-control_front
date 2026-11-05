import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import PresenceEntry from '@/features/dashboard/components/widgets/presence/PresenceEntry.vue';
import { createTestI18n } from '@/test-utils/i18n';
import type { PresenceView } from '../types';

const view = (overrides: Partial<PresenceView>): PresenceView => ({
  userId: 'u2',
  online: true,
  status: 'active',
  route: '/ups',
  title: 'Onduleurs',
  lastActivityAt: new Date().toISOString(),
  ...overrides,
});

const mountEntry = (value: PresenceView) =>
  mount(PresenceEntry, {
    props: { view: value, name: 'zoe', self: false },
    global: { plugins: [createTestI18n()] },
  });

describe('PresenceWidget entry', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useRealTimers();
  });

  it('shows the idle label for an idle user', () => {
    const since = new Date(Date.now() - 4 * 60_000).toISOString();
    const wrapper = mountEntry(view({ status: 'idle', lastActivityAt: since }));
    expect(wrapper.find('[data-part="where"]').text()).toBe(
      'Inactif depuis 4 min',
    );
  });

  it('shows no page when route and title are hidden', () => {
    const wrapper = mountEntry(
      view({ route: null, title: null, lastActivityAt: null }),
    );
    expect(wrapper.text()).toContain('zoe');
    expect(wrapper.find('[data-part="where"]').exists()).toBe(false);
  });
});
