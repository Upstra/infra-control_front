import { io, type Socket } from 'socket.io-client';
import { getCurrentScope, onScopeDispose } from 'vue';
import { getToken, onTokenChange } from '@/features/auth/token';

export type SocketNamespace = '' | '/ups' | '/alerts' | '/vmware';

type Handler = (...args: any[]) => void;

const sockets = new Map<SocketNamespace, Socket>();
let listeningToken = false;

const baseUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:3000';

const handleTokenChange = (token: string | null) => {
  sockets.forEach((socket, namespace) => {
    if (!token) {
      socket.disconnect();
      sockets.delete(namespace);
      return;
    }
    socket.auth = { token };
    if (socket.disconnected) socket.connect();
  });
};

const ensureTokenListener = () => {
  if (listeningToken) return;
  listeningToken = true;
  onTokenChange(handleTokenChange);
};

const createSocket = (namespace: SocketNamespace): Socket =>
  io(`${baseUrl()}${namespace}`, {
    auth: { token: getToken() },
    transports: ['websocket', 'polling'],
  });

export const getNamespaceSocket = (namespace: SocketNamespace): Socket => {
  ensureTokenListener();
  const existing = sockets.get(namespace);
  if (existing) return existing;
  const socket = createSocket(namespace);
  sockets.set(namespace, socket);
  return socket;
};

export const disconnectAllSockets = () => handleTokenChange(null);

export const useNamespaceSocket = (namespace: SocketNamespace) => {
  const socket = getNamespaceSocket(namespace);

  const on = (event: string, handler: Handler) => {
    socket.on(event, handler);
    const off = () => socket.off(event, handler);
    if (getCurrentScope()) onScopeDispose(off);
    return off;
  };

  const emit = (event: string, ...args: unknown[]) =>
    socket.emit(event, ...args);

  return { socket, on, emit };
};
