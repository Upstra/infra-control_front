import { defineStore } from 'pinia';
import { io, Socket } from 'socket.io-client';
import type {
  DiscoveryProgressDto,
  DiscoveryResultsDto,
  DiscoveredVmDto,
  ServerDiscoveryResult,
} from './types';

interface VmwareDiscoveryState {
  sessionId: string | null;
  isDiscovering: boolean;
  progress: number;
  status: 'idle' | 'starting' | 'discovering' | 'completed' | 'error';
  currentServer: string | null;
  serversProcessed: number;
  totalServers: number;
  discoveredVms: DiscoveredVmDto[];
  serverResults: ServerDiscoveryResult[];
  error: string | null;
  socket: Socket | null;
}

export const useVmwareDiscoveryStore = defineStore('vmwareDiscovery', {
  state: (): VmwareDiscoveryState => ({
    sessionId: null,
    isDiscovering: false,
    progress: 0,
    status: 'idle',
    currentServer: null,
    serversProcessed: 0,
    totalServers: 0,
    discoveredVms: [],
    serverResults: [],
    error: null,
    socket: null,
  }),

  getters: {
    progressPercentage: (state) => {
      if (state.totalServers === 0) return 0;
      return Math.round((state.serversProcessed / state.totalServers) * 100);
    },

    successfulServersCount: (state) => {
      return state.serverResults.filter((result) => result.success).length;
    },

    failedServersCount: (state) => {
      return state.serverResults.filter((result) => !result.success).length;
    },

    totalVmsDiscovered: (state) => {
      return state.discoveredVms.length;
    },

    isConnected: (state) => {
      return state.socket?.connected ?? false;
    },
  },

  actions: {
    connectToDiscovery(sessionId: string) {
      if (this.socket?.connected) {
        this.socket.disconnect();
      }

      this.sessionId = sessionId;
      this.isDiscovering = true;
      this.status = 'starting';
      this.error = null;

      const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      this.socket = io(`${socketUrl}/discovery`, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('Connected to discovery WebSocket');
        this.socket!.emit('join', sessionId);
      });

      this.socket.on('discovery:progress', (data: DiscoveryProgressDto) => {
        this.updateProgress(data);
      });

      this.socket.on('discovery:complete', (data: DiscoveryResultsDto) => {
        this.handleDiscoveryComplete(data);
      });

      this.socket.on('discovery:error', (error: { message: string }) => {
        this.handleError(error.message);
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from discovery WebSocket');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Discovery WebSocket connection error:', error);
        this.handleError('Failed to connect to discovery service');
      });
    },

    updateProgress(data: DiscoveryProgressDto) {
      this.status = data.status || 'discovering';
      this.currentServer = data.currentServer || null;
      this.progress = data.progress || 0;
      this.serversProcessed = data.serversProcessed || 0;
      this.totalServers = data.totalServers || 0;

      if (data.error) {
        this.error = data.error;
      }
    },

    handleDiscoveryComplete(data: DiscoveryResultsDto) {
      this.status = 'completed';
      this.isDiscovering = false;
      this.progress = 100;
      this.serversProcessed = data.totalServersProcessed;
      this.serverResults = data.serverResults;
      this.discoveredVms = data.allDiscoveredVms;
      this.currentServer = null;

      this.disconnectSocket();
    },

    handleError(message: string) {
      this.status = 'error';
      this.isDiscovering = false;
      this.error = message;
      this.disconnectSocket();
    },

    disconnectSocket() {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
    },

    reset() {
      this.disconnectSocket();
      this.sessionId = null;
      this.isDiscovering = false;
      this.progress = 0;
      this.status = 'idle';
      this.currentServer = null;
      this.serversProcessed = 0;
      this.totalServers = 0;
      this.discoveredVms = [];
      this.serverResults = [];
      this.error = null;
    },

    retryFailedServers() {
      const failedServerIds = this.serverResults
        .filter((result) => !result.success)
        .map((result) => result.serverId);

      if (failedServerIds.length === 0) {
        return;
      }

      // TODO: Implement retry logic with backend endpoint
      console.log('Retrying failed servers:', failedServerIds);
    },
  },
});
