import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePresenceStore } from '../store';
import { fetchPresence } from '../api';

vi.mock('../api', () => ({
  fetchPresence: vi.fn(),
  checkUserPresence: vi.fn(),
}));

const view = {
  userId: 'u1',
  online: true,
  status: 'active' as const,
  route: '/ups',
  title: 'Onduleurs',
  lastActivityAt: null,
};

describe('presence store', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('fills the online list and statuses from GET /presence', async () => {
    vi.mocked(fetchPresence).mockResolvedValue([view]);
    const store = usePresenceStore();
    await store.load();
    expect(store.online).toHaveLength(1);
    expect(store.statuses.u1).toBe(true);
  });

  it('removes a user who goes offline', () => {
    const store = usePresenceStore();
    store.apply(view);
    store.apply({ ...view, online: false, status: null });
    expect(store.online).toHaveLength(0);
    expect(store.statuses.u1).toBe(false);
  });
});
