import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import NotificationBell from '../components/bell/NotificationBell.vue';
import { useAlertsStore } from '../store';
import { makeAlert } from './fixtures';
import { createTestI18n } from '@/test-utils/i18n';

vi.mock('@/composables/useNamespaceSocket', () => ({
  useNamespaceSocket: () => ({ on: vi.fn(), emit: vi.fn() }),
}));

const mountBell = () =>
  mount(NotificationBell, {
    global: {
      plugins: [createTestI18n()],
      stubs: { RouterLink: RouterLinkStub },
    },
  });

describe('NotificationBell', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const store = useAlertsStore();
    store.setSummary({
      open: { critical: 1, warning: 3, info: 2 },
      unacknowledgedCritical: 1,
    });
    store.apply(makeAlert());
    store.apply(
      makeAlert({
        id: 'a2',
        severity: 'warning',
        type: 'server_psu_degraded',
        resourceType: 'server',
        resourceId: 's1',
        resourceName: 'srv-b2-03',
        title: 'PSU 2 absente',
      }),
    );
  });

  it('counts critical and warning alerts from the summary', () => {
    const wrapper = mountBell();
    expect(wrapper.find('[data-part="count"]').text()).toBe('4');
    expect(wrapper.find('button').attributes('aria-label')).toBe(
      'Notifications, 4 alertes actives',
    );
  });

  it('lists the open alerts in the popover', async () => {
    const wrapper = mountBell();
    await wrapper.find('button').trigger('click');
    const text = wrapper.find('[data-part="popover"]').text();
    expect(text).toContain('UPS-B2 est sur batterie');
    expect(text).toContain('PSU 2 absente');
  });

  it('links each alert to its resource', async () => {
    const wrapper = mountBell();
    await wrapper.find('button').trigger('click');
    const targets = wrapper
      .findAllComponents(RouterLinkStub)
      .map((link) => link.props('to'));
    expect(targets).toEqual(expect.arrayContaining(['/ups/u1', '/servers/s1']));
  });
});
