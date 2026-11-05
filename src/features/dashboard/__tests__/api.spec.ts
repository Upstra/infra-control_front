import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from '@/services/api';
import { dashboardApi } from '../api';

vi.mock('@/services/api', () => ({
  default: { get: vi.fn(), put: vi.fn() },
}));

const mocked = axios as unknown as {
  get: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
};

describe('dashboardApi', () => {
  beforeEach(() => {
    mocked.get.mockReset();
    mocked.put.mockReset();
  });

  it('unwraps the layouts list', async () => {
    mocked.get.mockResolvedValue({ data: { layouts: [{ id: 'l1' }] } });
    expect(await dashboardApi.getLayouts()).toEqual([{ id: 'l1' }]);
    expect(mocked.get).toHaveBeenCalledWith('/dashboard/layouts');
  });

  it('puts the layout payload as is', async () => {
    mocked.put.mockResolvedValue({ data: { id: 'l1' } });
    await dashboardApi.updateLayout('l1', { name: 'A', widgets: [] });
    expect(mocked.put).toHaveBeenCalledWith('/dashboard/layouts/l1', {
      name: 'A',
      widgets: [],
    });
  });
});
