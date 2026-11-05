import type { Socket } from 'socket.io-client';
import { storeToRefs } from 'pinia';
import { getNamespaceSocket } from '@/composables/useNamespaceSocket';
import { refreshAccessToken } from '@/features/auth/api/auth';
import { clearToken, onTokenChange, setToken } from '@/features/auth/token';
import { usePresenceStore } from '../store';
import { PING_INTERVAL_MS, backgroundPing, routePing } from '../domain/ping';
import type { PresencePing, PresenceView } from '../types';

interface CurrentPage {
  route: string;
  title: string | null;
}

let socket: Socket | null = null;
let pingTimer: ReturnType<typeof setInterval> | null = null;
let page: CurrentPage | null = null;
let watchingLogout = false;

const emitPing = (payload: PresencePing) => socket?.emit('user:ping', payload);

const pingCurrent = () => {
  if (!socket) return;
  if (
    typeof document !== 'undefined' &&
    document.visibilityState === 'hidden'
  ) {
    emitPing(backgroundPing());
    return;
  }
  if (page) emitPing(routePing(page.route, page.title));
};

const onVisibilityChange = () => pingCurrent();

const teardown = () => {
  if (pingTimer) clearInterval(pingTimer);
  pingTimer = null;
  if (typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', onVisibilityChange);
  }
  socket?.off('presence:update');
  socket?.off('auth:refresh');
  socket = null;
};

const refreshToken = async () => {
  try {
    const { data } = await refreshAccessToken();
    setToken(data.accessToken);
  } catch {
    clearToken();
    window.location.href = '/login';
  }
};

export const usePresenceSocket = () => {
  const presence = usePresenceStore();
  const { isConnected } = storeToRefs(presence);

  const connect = () => {
    if (socket) return;
    if (!watchingLogout) {
      watchingLogout = true;
      onTokenChange((token) => {
        if (token) return;
        teardown();
        isConnected.value = false;
      });
    }
    socket = getNamespaceSocket('');
    isConnected.value = true;
    socket.on('presence:update', (view: PresenceView) => presence.apply(view));
    socket.on('auth:refresh', refreshToken);
    socket.on('connect', () => {
      isConnected.value = true;
      pingCurrent();
    });
    socket.on('disconnect', () => {
      isConnected.value = false;
    });
    pingTimer = setInterval(pingCurrent, PING_INTERVAL_MS);
    document.addEventListener('visibilitychange', onVisibilityChange);
    presence.load();
  };

  const disconnect = () => {
    socket?.disconnect();
    teardown();
    isConnected.value = false;
  };

  const trackPage = (route: string, title: string | null) => {
    page = { route, title };
    pingCurrent();
  };

  const getSocketConnected = () => !!socket?.connected;

  const fetchStatuses = (userIds: string[]) => {
    socket?.emit(
      'presence:bulk-status-request',
      userIds,
      (statuses: Record<string, boolean>) => {
        presence.statuses = { ...presence.statuses, ...statuses };
      },
    );
  };

  return {
    connect,
    disconnect,
    trackPage,
    isConnected,
    getSocketConnected,
    fetchStatuses,
  };
};

export const resetPresenceSocketForTests = () => {
  teardown();
  page = null;
};
