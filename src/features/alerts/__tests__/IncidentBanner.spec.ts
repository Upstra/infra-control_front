import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises, RouterLinkStub } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import IncidentZone from '../components/banner/IncidentZone.vue';
import { useAlertsStore } from '../store';
import { alertsApi } from '../api';
import { makeAlert } from './fixtures';
import { createTestI18n } from '@/test-utils/i18n';

const showInfo = vi.fn();

vi.mock('../api', () => ({
  alertsApi: {
    acknowledge: vi.fn(),
    unacknowledge: vi.fn(),
    get: vi.fn(),
    summary: vi.fn(),
    list: vi.fn(),
  },
}));
vi.mock('@/composables/useNamespaceSocket', () => ({
  useNamespaceSocket: () => ({ on: vi.fn(), emit: vi.fn() }),
}));
vi.mock('@/shared/composables/useToast', () => ({
  useToast: () => ({ showInfo, showSuccess: vi.fn(), showError: vi.fn() }),
}));

const mountZone = () =>
  mount(IncidentZone, {
    global: {
      plugins: [createTestI18n()],
      stubs: { RouterLink: RouterLinkStub, Teleport: true },
    },
  });

describe('IncidentBanner', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders nothing without an open critical alert', () => {
    useAlertsStore().apply(makeAlert({ severity: 'warning' }));
    expect(mountZone().find('section').exists()).toBe(false);
  });

  it('stops breathing and shows the acknowledged chip once acknowledged', async () => {
    vi.mocked(alertsApi.get).mockResolvedValue(
      makeAlert({
        acknowledged: true,
        transitions: [
          {
            id: 't1',
            type: 'acknowledged',
            at: '2026-11-04T20:05:00.000Z',
            byUserId: 'u',
            byUsername: 'jbidule',
            fromSeverity: null,
            toSeverity: null,
          },
        ],
      }),
    );
    useAlertsStore().apply(makeAlert({ acknowledged: true }));
    const wrapper = mountZone();
    await flushPromises();
    expect(wrapper.find('section').classes()).not.toContain('pulse-crit-glow');
    expect(wrapper.find('[data-part="chip"]').text()).toContain(
      'ACQUITTÉ PAR JBIDULE',
    );
  });

  it('refreshes the store and toasts when the alert is already resolved', async () => {
    vi.mocked(alertsApi.acknowledge).mockRejectedValue({
      response: { status: 409 },
    });
    vi.mocked(alertsApi.summary).mockResolvedValue({
      open: { critical: 0, warning: 0, info: 0 },
      unacknowledgedCritical: 0,
    });
    vi.mocked(alertsApi.list).mockResolvedValue({
      items: [],
      totalItems: 0,
      currentPage: 1,
      totalPages: 0,
      pageSize: 100,
    });
    useAlertsStore().apply(makeAlert());
    const wrapper = mountZone();
    await wrapper.find('[data-part="acknowledge"]').trigger('click');
    await flushPromises();
    expect(alertsApi.list).toHaveBeenCalled();
    expect(showInfo).toHaveBeenCalledWith('Alerte déjà résolue');
    expect(wrapper.find('section').exists()).toBe(false);
  });
});
