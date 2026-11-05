import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useFeedStore } from '../store';
import { eventsApi } from '../api';
import type { FeedItem } from '../types';

vi.mock('../api', () => ({ eventsApi: { feed: vi.fn() } }));
vi.mock('@/composables/useNamespaceSocket', () => ({
  useNamespaceSocket: () => ({ on: vi.fn() }),
}));

const item = (id: string): FeedItem => ({
  id,
  kind: 'alert',
  tone: 'info',
  event: 'opened',
  title: id,
  resource: null,
  at: '',
  by: null,
  alertId: null,
});

describe('feed store', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('loads the next page with the cursor', async () => {
    vi.mocked(eventsApi.feed).mockResolvedValueOnce({
      items: [item('b')],
      nextCursor: 'c1',
    });
    const store = useFeedStore();
    await store.load();
    vi.mocked(eventsApi.feed).mockResolvedValueOnce({
      items: [item('a')],
      nextCursor: null,
    });
    await store.loadMore();
    expect(eventsApi.feed).toHaveBeenLastCalledWith({
      limit: 30,
      cursor: 'c1',
    });
    expect(store.items.map((i) => i.id)).toEqual(['b', 'a']);
  });

  it('keeps the last items and marks them stale on a network error', async () => {
    vi.mocked(eventsApi.feed).mockResolvedValueOnce({
      items: [item('b')],
      nextCursor: null,
    });
    const store = useFeedStore();
    await store.load();
    vi.mocked(eventsApi.feed).mockRejectedValueOnce(new Error('offline'));
    await store.refreshHead();
    expect(store.items).toHaveLength(1);
    expect(store.stale).toBe(true);
  });
});
