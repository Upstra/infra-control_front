import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import KpisWidget from '../components/widgets/kpis/KpisWidget.vue';
import { dashboardApi } from '../api';
import { roomApi } from '@/features/rooms/api';
import { createTestI18n } from '@/test-utils/i18n';
import type { FullDashboardStatsDto } from '../types';

vi.mock('../api', () => ({ dashboardApi: { getFullStats: vi.fn() } }));
vi.mock('@/features/rooms/api', () => ({
  roomApi: { fetchRoomById: vi.fn() },
}));

const stats = (
  overrides: Partial<FullDashboardStatsDto>,
): FullDashboardStatsDto => ({
  totalUsers: 1,
  adminUsers: 1,
  totalRooms: 1,
  totalUps: 1,
  totalServers: 1,
  totalVms: 1,
  serversUp: 1,
  serversDown: 0,
  vmsUp: 1,
  vmsDown: 0,
  setupComplete: true,
  setupProgress: 100,
  onlineUsers: 1,
  hostsTotal: 4,
  hostsConnected: 4,
  vmsByHealth: { up: 10, degraded: 0, down: 0, unknown: 0 },
  totalPowerW: 5480,
  totalCapacityW: null,
  maxInletC: 31,
  maxInletRoomId: 'room-b',
  maxInletServerName: 'srv-b2-03',
  ...overrides,
});

const mountWidget = async () => {
  const wrapper = mount(KpisWidget, {
    global: { plugins: [createTestI18n()] },
  });
  await flushPromises();
  return wrapper;
};

describe('KpisWidget', () => {
  beforeEach(() => {
    vi.mocked(roomApi.fetchRoomById).mockResolvedValue({
      id: 'room-b',
      name: 'Salle B',
      inletWarnC: 30,
    });
  });

  it('shows an em dash share when the total capacity is unknown', async () => {
    vi.mocked(dashboardApi.getFullStats).mockResolvedValue(stats({}));
    const power = (await mountWidget()).find('[data-kpi="power"]');
    expect(power.text()).toContain('capacité inconnue');
    expect(power.find('.h-1\\.5').exists()).toBe(false);
  });

  it('turns the temperature tile to warning above the room threshold', async () => {
    vi.mocked(dashboardApi.getFullStats).mockResolvedValue(
      stats({ maxInletC: 31 }),
    );
    const temp = (await mountWidget()).find('[data-kpi="temp"]');
    expect(temp.attributes('data-state')).toBe('warning');
    expect(temp.text()).toContain('srv-b2-03 · Salle B');
  });

  it('keeps the tile nominal at or below the threshold and shows null as —', async () => {
    vi.mocked(dashboardApi.getFullStats).mockResolvedValue(
      stats({ maxInletC: null, totalPowerW: null }),
    );
    const wrapper = await mountWidget();
    expect(wrapper.find('[data-kpi="temp"]').attributes('data-state')).toBe(
      'ok',
    );
    expect(wrapper.find('[data-kpi="power"] [data-part="value"]').text()).toBe(
      '—',
    );
  });
});
