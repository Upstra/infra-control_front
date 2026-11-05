import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

const emit = vi.fn();
const fakeSocket = {
  on: vi.fn(),
  off: vi.fn(),
  emit,
  disconnect: vi.fn(),
  connected: true,
};

vi.mock('@/composables/useNamespaceSocket', () => ({
  getNamespaceSocket: () => fakeSocket,
}));
vi.mock('../api', () => ({
  fetchPresence: vi.fn().mockResolvedValue([]),
  checkUserPresence: vi.fn(),
}));

import {
  usePresenceSocket,
  resetPresenceSocketForTests,
} from '../composables/usePresenceSocket';

const setVisibility = (state: 'visible' | 'hidden') =>
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => state,
  });

describe('presence ping', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    resetPresenceSocketForTests();
    emit.mockClear();
    setVisibility('visible');
  });

  it('pings with the route and title on page change', () => {
    const presence = usePresenceSocket();
    presence.connect();
    presence.trackPage('/ups/u1', 'Onduleurs');
    expect(emit).toHaveBeenLastCalledWith('user:ping', {
      route: '/ups/u1',
      title: 'Onduleurs',
    });
  });

  it('sends active: false while the tab is hidden', () => {
    const presence = usePresenceSocket();
    presence.connect();
    presence.trackPage('/servers', 'Serveurs');
    setVisibility('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    expect(emit).toHaveBeenLastCalledWith('user:ping', { active: false });
  });
});
