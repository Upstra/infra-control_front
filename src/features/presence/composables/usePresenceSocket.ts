import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/features/auth/store";
import { usePresenceStore } from "@/features/presence/store";
import { onBeforeUnmount } from "vue";

let socket: Socket | null = null;

export const usePresenceSocket = () => {
  const auth = useAuthStore();
  const presenceStore = usePresenceStore();

  const connect = () => {
    if (!auth.token || presenceStore.connected) return;

    socket = io(import.meta.env.VITE_WS_URL, {
      auth: {
        token: auth.token,
      },
    });

    presenceStore.connected = true;

    socket.on("connect", () => {
      console.log("🔌 Connected to presence socket");
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from presence socket");
    });

    socket.on("presence:update", ({ userId, online }) => {
      presenceStore.statuses[userId] = online;
    });

    const interval = setInterval(() => {
      socket?.emit("user:ping");
    }, 30_000);

    onBeforeUnmount(() => {
      clearInterval(interval);
      socket?.disconnect();
    });
  };

  const disconnect = () => {
    socket?.disconnect();
    socket = null;
  };

  const isConnected = () => !!socket?.connected;

const fetchStatuses = (userIds: string[]) => {
  if (!socket) return;
  socket.emit(
    "presence:bulk-status-request",
    userIds,
    (statuses: Record<string, boolean>) => {
      presenceStore.statuses = { ...presenceStore.statuses, ...statuses };
    }
  );
};

  return {
    connect,
    disconnect,
    isConnected,
    fetchStatuses,
  };
};
