import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/features/auth/store';
import { migrationApi } from './api';
import type {
  MigrationState,
  MigrationStatus,
  MigrationEvent,
  MigrationDestinationResponse,
  DestinationsConfigRequest,
  MigrationConfigUpdatedEvent,
  MigrationErrorEvent,
} from './types';

export const useMigrationStore = defineStore('migration', () => {
  const authStore = useAuthStore();

  const socket = ref<Socket | null>(null);
  const isConnected = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const migrationStatus = ref<MigrationStatus>({
    state: 'idle',
    events: [],
  });

  const destinations = ref<MigrationDestinationResponse[]>([]);
  const yamlPath = ref<string>('');

  const currentState = computed(() => migrationStatus.value.state);
  const events = computed(() => migrationStatus.value.events);
  const currentOperation = computed(
    () => migrationStatus.value.currentOperation,
  );
  const canStartMigration = computed(
    () => migrationStatus.value.state === 'idle',
  );
  const canRestart = computed(() => migrationStatus.value.state === 'migrated');
  const canCancel = computed(() =>
    ['in migration', 'restarting'].includes(migrationStatus.value.state),
  );

  const connectToWebSocket = () => {
    if (socket.value?.connected) {
      return;
    }

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    socket.value = io(`${socketUrl}/migration`, {
      auth: {
        token: authStore.token,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.value.on('connect', () => {
      console.log('Connected to migration WebSocket');
      isConnected.value = true;
      socket.value?.emit('migration:getStatus');
    });

    socket.value.on('disconnect', () => {
      console.log('Disconnected from migration WebSocket');
      isConnected.value = false;
    });

    socket.value.on('connect_error', (err) => {
      console.error('Migration WebSocket connection error:', err);
      error.value = 'Failed to connect to migration service';
    });

    socket.value.on('migration:status', (status: MigrationStatus) => {
      migrationStatus.value = status;
    });

    socket.value.on(
      'migration:stateChange',
      (data: { state: MigrationState }) => {
        migrationStatus.value.state = data.state;
      },
    );

    socket.value.on('migration:event', (event: MigrationEvent) => {
      migrationStatus.value.events.push(event);
    });

    socket.value.on(
      'migration:operationChange',
      (data: { operation: string }) => {
        migrationStatus.value.currentOperation = data.operation;
      },
    );

    socket.value.on(
      'migration:configUpdated',
      (data: MigrationConfigUpdatedEvent) => {
        yamlPath.value = data.yamlPath;
      },
    );

    socket.value.on('migration:error', (data: MigrationErrorEvent) => {
      error.value = data.message;
    });

    socket.value.on('migration:started', (data: { success: boolean }) => {
      if (data.success) {
        migrationStatus.value.state = 'in migration';
      }
    });

    socket.value.on('migration:restarted', (data: { success: boolean }) => {
      if (data.success) {
        migrationStatus.value.state = 'restarting';
      }
    });

    socket.value.on('migration:cancelled', (data: { success: boolean }) => {
      if (data.success) {
        migrationStatus.value.state = 'idle';
      }
    });
  };

  const disconnectWebSocket = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
      isConnected.value = false;
    }
  };

  const fetchDestinations = async () => {
    try {
      isLoading.value = true;
      const response = await migrationApi.getDestinations();
      destinations.value = response.data.destinations;
      yamlPath.value = response.data.yamlPath;
      return response.data;
    } catch (err: any) {
      error.value =
        err.response?.data?.message || 'Failed to fetch destinations';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const configureDestinations = async (config: DestinationsConfigRequest) => {
    try {
      isLoading.value = true;
      const response = await migrationApi.configureDestinations(config);
      await fetchDestinations();
      return response.data;
    } catch (err: any) {
      error.value =
        err.response?.data?.message || 'Failed to configure destinations';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const removeDestination = async (sourceServerId: string) => {
    try {
      isLoading.value = true;
      const response = await migrationApi.removeDestination(sourceServerId);
      await fetchDestinations();
      return response.data;
    } catch (err: any) {
      error.value =
        err.response?.data?.message || 'Failed to remove destination';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await migrationApi.getStatus();
      migrationStatus.value = response.data;
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch status';
      throw err;
    }
  };

  const startMigration = (planPath?: string) => {
    console.log('startMigration called', {
      connected: socket.value?.connected,
      socket: !!socket.value,
      currentState: migrationStatus.value.state,
    });

    if (!socket.value?.connected) {
      error.value = 'Not connected to migration service';
      console.error('Cannot start migration: WebSocket not connected');
      return;
    }

    const payload = {
      planPath: planPath || 'migration.yml',
    };

    console.log('Emitting migration:start event with payload:', payload);
    socket.value.emit('migration:start', payload);
  };

  const startRestart = () => {
    if (!socket.value?.connected) {
      error.value = 'Not connected to migration service';
      return;
    }
    socket.value.emit('migration:restart');
  };

  const cancelMigration = () => {
    if (!socket.value?.connected) {
      error.value = 'Not connected to migration service';
      return;
    }
    socket.value.emit('migration:cancel');
  };

  const clearMigrationData = async () => {
    try {
      await migrationApi.clearMigrationData();
      migrationStatus.value = {
        state: 'idle',
        events: [],
      };
    } catch (err: any) {
      error.value =
        err.response?.data?.message || 'Failed to clear migration data';
      throw err;
    }
  };

  const reset = () => {
    disconnectWebSocket();
    migrationStatus.value = {
      state: 'idle',
      events: [],
    };
    destinations.value = [];
    yamlPath.value = '';
    error.value = null;
  };

  return {
    socket,
    isConnected,
    isLoading,
    error,
    migrationStatus,
    destinations,
    yamlPath,

    currentState,
    events,
    currentOperation,
    canStartMigration,
    canRestart,
    canCancel,

    connectToWebSocket,
    disconnectWebSocket,
    fetchDestinations,
    configureDestinations,
    removeDestination,
    fetchStatus,
    startMigration,
    startRestart,
    cancelMigration,
    clearMigrationData,
    reset,
  };
});
