import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useDashboardStore } from '../store';
import { dashboardApi } from '../api';
import type { DashboardLayout } from '../types';

vi.mock('../api', () => ({
  dashboardApi: {
    getLayouts: vi.fn(),
    updateLayout: vi.fn(),
    deleteLayout: vi.fn(),
    createLayout: vi.fn(),
  },
}));

const layout = (id: string, isDefault: boolean): DashboardLayout => ({
  id,
  name: id,
  columns: 12,
  rowHeight: 80,
  isDefault,
  userId: 'u',
  createdAt: '',
  updatedAt: '',
  widgets: [
    {
      id: `${id}-w`,
      type: 'kpis',
      title: 'kpis',
      position: { x: 0, y: 0, w: 12, h: 1 },
    },
  ],
});

describe('dashboard store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(dashboardApi.getLayouts).mockResolvedValue([
      layout('a', false),
      layout('b', true),
    ]);
  });

  it('opens the default board first', async () => {
    const store = useDashboardStore();
    await store.load();
    expect(store.active?.id).toBe('b');
  });

  it('saves widgets as rank and width', async () => {
    const store = useDashboardStore();
    await store.load();
    vi.mocked(dashboardApi.updateLayout).mockResolvedValue(layout('b', true));
    await store.save(store.active!);
    expect(dashboardApi.updateLayout).toHaveBeenCalledWith('b', {
      name: 'b',
      widgets: [
        expect.objectContaining({ position: { x: 0, y: 0, w: 12, h: 1 } }),
      ],
    });
  });

  it('falls back to the default board after deleting the active one', async () => {
    const store = useDashboardStore();
    await store.load();
    store.select('a');
    await store.remove('a');
    expect(store.active?.id).toBe('b');
  });
});
