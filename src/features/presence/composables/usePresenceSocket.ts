import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/features/auth/store';
import { usePresenceStore } from '@/features/presence/store';
import { refreshAccessToken } from '@/features/auth/api/auth';
import { setToken, clearToken } from '@/features/auth/token';
import { onBeforeUnmount, watch, getCurrentInstance } from 'vue';
import { storeToRefs } from 'pinia';

let socket: Socket | null = null;
let pingInterval: NodeJS.Timeout | null = null;

export const usePresenceSocket = () => {
  const auth = useAuthStore();
  const presenceStore = usePresenceStore();
  const { isConnected } = storeToRefs(presenceStore);
  watch(
    () => auth.token,
    (newToken) => {
      if (socket) {
        if (!newToken) {
          socket.disconnect();
          isConnected.value = false;
          return;
        }
        socket.auth = { token: newToken } as any;
        if (socket.disconnected) {
          socket.connect();
        }
      }
    },
  );

  const connect = () => {
    if (!auth.token || isConnected.value) return;

    socket = io(import.meta.env.VITE_WS_URL, {
      auth: {
        token: auth.token,
      },
    });

    isConnected.value = true;

    socket.on('connect', () => {});

    socket.on('disconnect', () => {
      isConnected.value = false;
    });

    socket.on('auth:refresh', async () => {
      try {
        const { data } = await refreshAccessToken();
        setToken(data.accessToken);
        auth.token = data.accessToken;
        if (socket) {
          socket.auth = { token: data.accessToken } as any;
        }
      } catch {
        clearToken();
        window.location.href = '/login';
      }
    });

    socket.on('presence:update', ({ userId, online }) => {
      presenceStore.statuses[userId] = online;
    });

    if (pingInterval) {
      clearInterval(pingInterval);
    }

    pingInterval = setInterval(() => {
      socket?.emit('user:ping');
    }, 30_000);

    if (getCurrentInstance()) {
      onBeforeUnmount(() => {
        if (pingInterval) {
          clearInterval(pingInterval);
          pingInterval = null;
        }
        socket?.disconnect();
        isConnected.value = false;
      });
    }
  };

  const disconnect = () => {
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
    socket?.disconnect();
    socket = null;
    isConnected.value = false;
  };

  // Ici, change le nom pour éviter la collision avec le ref isConnected
  const getSocketConnected = () => !!socket?.connected;

  const fetchStatuses = (userIds: string[]) => {
    if (!socket) return;
    socket.emit(
      'presence:bulk-status-request',
      userIds,
      (statuses: Record<string, boolean>) => {
        presenceStore.statuses = { ...presenceStore.statuses, ...statuses };
      },
    );
  };

  return {
    connect,
    disconnect,
    isConnected,
    getSocketConnected,
    fetchStatuses,
  };
};
