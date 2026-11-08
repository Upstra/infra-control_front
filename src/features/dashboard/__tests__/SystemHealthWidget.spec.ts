import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import SystemHealthWidget from '../components/widgets/health/SystemHealthWidget.vue';
import { dashboardApi } from '../api';
import { createTestI18n } from '@/test-utils/i18n';
import type { SystemHealthResponse } from '../types';

vi.mock('../api', () => ({ dashboardApi: { getSystemHealth: vi.fn() } }));

const health: SystemHealthResponse = {
  status: 'degraded',
  score: 66,
  lastCheck: '2026-11-08T10:00:00.000Z',
  components: [
    {
      key: 'database',
      name: 'PostgreSQL',
      status: 'operational',
      responseTime: 4,
      uptime: null,
      detail: 'Database connection is healthy',
    },
    {
      key: 'vcenter',
      name: 'vCenter telemetry',
      status: 'down',
      responseTime: 2,
      uptime: null,
      detail: 'Last vCenter snapshot 420s ago',
    },
    // An older backend: no key, English name only.
    { name: 'Legacy check', status: 'operational', responseTime: 1, uptime: null },
  ],
};

const mountWidget = async () => {
  const wrapper = mount(SystemHealthWidget, {
    global: { plugins: [createTestI18n()] },
  });
  await flushPromises();
  return wrapper;
};

describe('SystemHealthWidget', () => {
  beforeEach(() => {
    vi.mocked(dashboardApi.getSystemHealth).mockResolvedValue(health);
  });

  it('translates components by key and falls back to the backend name', async () => {
    const text = (await mountWidget()).text();
    expect(text).toContain('PostgreSQL');
    expect(text).toContain('Télémétrie vCenter');
    expect(text).toContain('Legacy check');
    expect(text).not.toContain('GitHub');
  });

  it('shows the backend detail only for components that need attention', async () => {
    const text = (await mountWidget()).text();
    expect(text).toContain('Last vCenter snapshot 420s ago');
    expect(text).not.toContain('Database connection is healthy');
  });
});
