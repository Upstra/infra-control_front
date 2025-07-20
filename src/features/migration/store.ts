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
  const isMigrationInProgress = ref(false);

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
    () =>
      ['idle', 'failed'].includes(migrationStatus.value.state) &&
      !isMigrationInProgress.value,
  );
  const canRestart = computed(
    () =>
      migrationStatus.value.state === 'migrated' &&
      !isMigrationInProgress.value,
  );
  const canCancel = computed(() =>
    ['grace_shutdown', 'shutting_down', 'in_migration', 'restarting'].includes(
      migrationStatus.value.state,
    ),
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
      isConnected.value = true;
      socket.value?.emit('migration:getStatus');
    });

    socket.value.on('disconnect', () => {
      isConnected.value = false;
    });

    socket.value.on('connect_error', () => {
      error.value = 'Failed to connect to migration service';
    });

    socket.value.on('migration:status', (status: MigrationStatus) => {
      migrationStatus.value = status;
      if (status.error) {
        error.value = status.error;
      }
    });

    socket.value.on(
      'migration:stateChange',
      (data: {
        state: MigrationState;
        startTime?: string;
        endTime?: string;
        error?: string;
      }) => {
        migrationStatus.value.state = data.state;
        if (data.startTime) migrationStatus.value.startTime = data.startTime;
        if (data.endTime) {
          migrationStatus.value.endTime = data.endTime;
          if (['idle', 'failed', 'migrated'].includes(data.state)) {
            isMigrationInProgress.value = false;
          }
        }
        if (data.error) {
          migrationStatus.value.error = data.error;
          error.value = data.error;
          isMigrationInProgress.value = false;
        }
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

    socket.value.on(
      'migration:started',
      (data: { success: boolean; state?: MigrationState }) => {
        if (data.success) {
          isMigrationInProgress.value = true;
          migrationStatus.value.state = data.state || 'grace_shutdown';
          migrationStatus.value.startTime = new Date().toISOString();
          delete migrationStatus.value.endTime;
          delete migrationStatus.value.error;
          error.value = null;
        }
      },
    );

    socket.value.on('migration:restarted', (data: { success: boolean }) => {
      if (data.success) {
        isMigrationInProgress.value = true;
        migrationStatus.value.state = 'restarting';
      }
    });

    socket.value.on('migration:cancelled', (data: { success: boolean }) => {
      if (data.success) {
        isMigrationInProgress.value = false;
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
      inProgress: isMigrationInProgress.value,
    });

    if (!socket.value?.connected) {
      error.value = 'Not connected to migration service';
      console.error('Cannot start migration: WebSocket not connected');
      return;
    }

    if (isMigrationInProgress.value) {
      error.value = 'Migration already in progress';
      console.error('Cannot start migration: Migration already in progress');
      return;
    }

    const payload = {
      planPath: planPath || '/home/upstra/ups_manager/plans/migration.yml',
    };

    console.log('Emitting migration:start event with payload:', payload);
    socket.value.emit('migration:start', payload);
  };

  const startRestart = () => {
    if (!socket.value?.connected) {
      error.value = 'Not connected to migration service';
      return;
    }

    if (isMigrationInProgress.value) {
      error.value = 'Migration already in progress';
      console.error('Cannot start restart: Migration already in progress');
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
      isMigrationInProgress.value = false;
    } catch (err: any) {
      error.value =
        err.response?.data?.message || 'Failed to clear migration data';
      throw err;
    }
  };

  const updateSelectedDestinationsCount = (count: number) => {
    console.log('Updating selected destinations count:', count);
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
    isMigrationInProgress.value = false;
  };

  return {
    socket,
    isConnected,
    isLoading,
    error,
    migrationStatus,
    destinations,
    yamlPath,
    isMigrationInProgress,

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
    updateSelectedDestinationsCount,
    reset,
  };
});
