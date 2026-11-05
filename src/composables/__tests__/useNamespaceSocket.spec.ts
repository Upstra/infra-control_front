import { describe, it, expect, vi, beforeEach } from 'vitest';

const ioMock = vi.fn(() => ({
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  connect: vi.fn(),
  disconnect: vi.fn(),
  disconnected: true,
  auth: {},
}));

vi.mock('socket.io-client', () => ({ io: ioMock }));

describe('useNamespaceSocket', () => {
  beforeEach(() => {
    vi.resetModules();
    ioMock.mockClear();
    localStorage.setItem('token', 'abc');
  });

  it('shares one socket per namespace and passes the token', async () => {
    const { useNamespaceSocket } = await import('../useNamespaceSocket');
    const a = useNamespaceSocket('/alerts');
    const b = useNamespaceSocket('/alerts');
    useNamespaceSocket('/ups');
    expect(a.socket).toBe(b.socket);
    expect(ioMock).toHaveBeenCalledTimes(2);
    expect(ioMock.mock.calls[0][1]).toMatchObject({ auth: { token: 'abc' } });
  });

  it('reconnects with the refreshed token and closes on logout', async () => {
    const { useNamespaceSocket } = await import('../useNamespaceSocket');
    const { setToken, clearToken } = await import('@/features/auth/token');
    const { socket } = useNamespaceSocket('/vmware');
    setToken('fresh');
    expect(socket.auth).toEqual({ token: 'fresh' });
    expect(socket.connect).toHaveBeenCalled();
    clearToken();
    expect(socket.disconnect).toHaveBeenCalled();
  });
});
