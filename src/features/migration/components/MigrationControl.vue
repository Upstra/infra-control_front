<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
  >
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
        {{ t('migration.control.title') }}
      </h2>
      <div class="flex items-center gap-2">
        <div
          class="w-2 h-2 rounded-full"
          :class="isConnected ? 'bg-green-500' : 'bg-red-500'"
        ></div>
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{
            isConnected
              ? t('migration.control.connected')
              : t('migration.control.disconnected')
          }}
        </span>
      </div>
    </div>

    <div class="mb-6">
      <div class="flex flex-col items-center justify-center">
        <div
          class="px-6 py-3 rounded-lg text-lg font-medium transition-all"
          :class="stateClass"
        >
          {{ getStateLabel(currentState) }}
        </div>
        <div
          v-if="
            currentState === 'failed' && migrationStore.migrationStatus.endTime
          "
          class="mt-2 text-sm text-gray-500 dark:text-gray-400"
        >
          {{ t('migration.control.failed_at') }}:
          {{ formatTime(migrationStore.migrationStatus.endTime) }}
        </div>
      </div>

      <div v-if="currentOperation" class="mt-4 text-center">
        <div
          class="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400"
        >
          <div
            class="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"
          ></div>
          <span class="text-sm">{{ currentOperation }}</span>
        </div>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 justify-center">
      <button
        @click="handleStartMigration"
        :disabled="!canStartMigration || !isConnected"
        class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
      >
        <PlayCircle class="w-5 h-5" />
        {{
          currentState === 'failed'
            ? t('migration.control.retry')
            : t('migration.control.start')
        }}
      </button>

      <button
        @click="handleStartRestart"
        :disabled="!canRestart || !isConnected"
        class="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-medium rounded-lg shadow-lg hover:from-green-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
      >
        <RefreshCw class="w-5 h-5" />
        {{ t('migration.control.restart') }}
      </button>

      <button
        v-if="canClearData"
        @click="handleClearData"
        :disabled="!isConnected"
        class="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-medium rounded-lg shadow-lg hover:from-orange-700 hover:to-amber-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
      >
        <Trash2 class="w-5 h-5" />
        {{ t('migration.control.clear_data') }}
      </button>

      <button
        v-if="canCancel"
        @click="handleCancel"
        :disabled="!canCancel || !isConnected"
        class="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-medium rounded-lg shadow-lg hover:from-red-700 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
      >
        <XCircle class="w-5 h-5" />
        {{ t('migration.control.cancel') }}
      </button>
    </div>

    <div
      v-if="migrationStore.migrationStatus.error || error"
      class="mt-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4"
    >
      <p class="text-sm text-red-800 dark:text-red-200">
        {{ migrationStore.migrationStatus.error || error }}
      </p>
    </div>

    <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
      <div class="text-sm text-gray-600 dark:text-gray-400">
        <h3 class="font-medium mb-2">
          {{ t('migration.control.info_title') }}
        </h3>
        <ul class="space-y-1 list-disc list-inside">
          <li>{{ t('migration.control.info_migration') }}</li>
          <li>{{ t('migration.control.info_restart') }}</li>
          <li>{{ t('migration.control.info_cancel') }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { PlayCircle, RefreshCw, XCircle, Trash2 } from 'lucide-vue-next';
import { useMigrationStore } from '../store';
import { useConfirm } from '@/shared/composables/useConfirm';
import { useToast } from '@/shared/composables/useToast';
import type { MigrationState } from '../types';

const { t } = useI18n();
const { confirm } = useConfirm();
const { showToast } = useToast();
const migrationStore = useMigrationStore();

const isConnected = computed(() => migrationStore.isConnected);
const currentState = computed(() => migrationStore.currentState);
const currentOperation = computed(() => migrationStore.currentOperation);
const canStartMigration = computed(() => migrationStore.canStartMigration);
const canRestart = computed(() => migrationStore.canRestart);
const canCancel = computed(() => migrationStore.canCancel);
const canClearData = computed(() =>
  ['failed', 'migrated'].includes(currentState.value),
);
const error = computed(() => migrationStore.error);

const stateClass = computed(() => {
  const state = currentState.value;
  switch (state) {
    case 'idle':
      return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    case 'grace_shutdown':
      return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200';
    case 'shutting_down':
      return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200';
    case 'in_migration':
      return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200';
    case 'migrated':
      return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';
    case 'restarting':
      return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200';
    case 'failed':
      return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  }
});

const getStateLabel = (state: MigrationState) => {
  switch (state) {
    case 'idle':
      return t('migration.states.idle');
    case 'grace_shutdown':
      return t('migration.states.grace_shutdown');
    case 'shutting_down':
      return t('migration.states.shutting_down');
    case 'in_migration':
      return t('migration.states.in_migration');
    case 'migrated':
      return t('migration.states.migrated');
    case 'restarting':
      return t('migration.states.restarting');
    case 'failed':
      return t('migration.states.failed');
    default:
      return state;
  }
};

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString();
};

const handleStartMigration = async () => {
  const confirmed = await confirm({
    title: t('migration.control.confirm_start_title'),
    message: t('migration.control.confirm_start_message'),
    confirmText: t('migration.control.confirm_start_button'),
    confirmButtonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
  });

  if (confirmed) {
    migrationStore.startMigration();
    showToast(t('migration.control.start_initiated'), 'info');
  } else {
  }
};

const handleStartRestart = async () => {
  const confirmed = await confirm({
    title: t('migration.control.confirm_restart_title'),
    message: t('migration.control.confirm_restart_message'),
    confirmText: t('migration.control.confirm_restart_button'),
    confirmButtonClass: 'bg-green-600 hover:bg-green-700 text-white',
  });

  if (confirmed) {
    migrationStore.startRestart();
    showToast(t('migration.control.restart_initiated'), 'info');
  }
};

const handleCancel = async () => {
  const confirmed = await confirm({
    title: t('migration.control.confirm_cancel_title'),
    message: t('migration.control.confirm_cancel_message'),
    confirmText: t('migration.control.confirm_cancel_button'),
    confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white',
  });

  if (confirmed) {
    migrationStore.cancelMigration();
    showToast(t('migration.control.cancel_initiated'), 'info');
  }
};

const handleClearData = async () => {
  const confirmed = await confirm({
    title: t('migration.control.confirm_clear_title'),
    message: t('migration.control.confirm_clear_message'),
    confirmText: t('migration.control.confirm_clear_button'),
    confirmButtonClass: 'bg-orange-600 hover:bg-orange-700 text-white',
  });

  if (confirmed) {
    await migrationStore.clearMigrationData();
    showToast(t('migration.control.clear_success'), 'success');
  }
};

onMounted(() => {
  console.log('MigrationControl mounted, connecting WebSocket...');
  migrationStore.connectToWebSocket();
  migrationStore.fetchStatus().catch((err) => {
    console.error('Failed to fetch migration status:', err);
  });

  // Log initial state after a short delay to allow WebSocket to connect
  setTimeout(() => {
    console.log('Migration initial state:', {
      isConnected: isConnected.value,
      canStartMigration: canStartMigration.value,
      currentState: currentState.value,
      migrationState: migrationStore.migrationStatus.state,
    });
  }, 1000);
});

onUnmounted(() => {
  migrationStore.disconnectWebSocket();
});
</script>
