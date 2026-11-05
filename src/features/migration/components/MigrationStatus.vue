<template>
  <div
    class="bg-surface rounded-lg shadow-sm border border-border p-6"
  >
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-text-strong">
        {{ t('migration.status.title') }}
      </h2>
      <button
        v-if="events.length > 0"
        @click="handleClearEvents"
        class="text-sm text-danger-text hover:underline"
      >
        {{ t('migration.status.clear_history') }}
      </button>
    </div>

    <div v-if="events.length === 0" class="text-center py-12">
      <Database class="w-12 h-12 text-text-muted mx-auto mb-3" />
      <p class="text-text-muted">
        {{ t('migration.status.no_events') }}
      </p>
    </div>

    <div v-else class="space-y-3 max-h-96 overflow-y-auto">
      <div
        v-for="(event, index) in sortedEvents"
        :key="`${event.timestamp}-${index}`"
        class="flex items-start gap-3 p-3 rounded-lg transition-colors"
        :class="getEventClass(event)"
      >
        <div class="flex-shrink-0 mt-0.5">
          <component
            :is="getEventIcon(event)"
            class="w-5 h-5"
            :class="getEventIconColor(event)"
          />
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1">
              <p class="font-medium text-text-strong">
                {{ getEventTitle(event) }}
              </p>
              <p class="text-sm text-text mt-1">
                {{ event.message || getEventDescription(event) }}
              </p>
              <p
                v-if="event.error"
                class="text-sm text-danger-text mt-1"
              >
                {{ t('migration.status.error') }}: {{ event.error }}
              </p>
            </div>
            <time
              class="text-xs text-text-muted flex-shrink-0"
            >
              {{ formatTime(event.timestamp) }}
            </time>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="migrationStatus.startTime"
      class="mt-6 pt-6 border-t border-border"
    >
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="text-text"
            >{{ t('migration.status.start_time') }}:</span
          >
          <span class="ml-2 font-medium text-text-strong">
            {{ formatDateTime(migrationStatus.startTime) }}
          </span>
        </div>
        <div v-if="migrationStatus.endTime">
          <span class="text-text"
            >{{ t('migration.status.end_time') }}:</span
          >
          <span class="ml-2 font-medium text-text-strong">
            {{ formatDateTime(migrationStatus.endTime) }}
          </span>
        </div>
        <div>
          <span class="text-text"
            >{{ t('migration.status.total_events') }}:</span
          >
          <span class="ml-2 font-medium text-text-strong">
            {{ events.length }}
          </span>
        </div>
        <div>
          <span class="text-text"
            >{{ t('migration.status.failed_events') }}:</span
          >
          <span
            class="ml-2 font-medium"
            :class="
              failedCount > 0
                ? 'text-danger-text'
                : 'text-text-strong'
            "
          >
            {{ failedCount }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  Database,
  Server,
  CheckCircle,
  XCircle,
  Clock,
  PlayCircle,
  StopCircle,
  RefreshCw,
} from 'lucide-vue-next';
import { useMigrationStore } from '../store';
import { useConfirm } from '@/shared/composables/useConfirm';
import { useToast } from '@/shared/composables/useToast';
import type { MigrationEvent } from '../types';

const { t } = useI18n();
const { confirm } = useConfirm();
const { showToast } = useToast();
const migrationStore = useMigrationStore();

const migrationStatus = computed(() => migrationStore.migrationStatus);
const events = computed(() => migrationStore.events);

const sortedEvents = computed(() =>
  [...events.value].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  ),
);

const failedCount = computed(
  () => events.value.filter((event) => !event.success).length,
);

const getEventClass = (event: MigrationEvent) => {
  if (!event.success) {
    return 'bg-danger-surface border border-danger-border';
  }

  switch (event.type) {
    case 'grace_period':
      return 'bg-warning-surface border border-warning/40';
    case 'vm_shutdown':
    case 'server_shutdown':
    case 'start_shutdown':
    case 'finish_shutdown':
      return 'bg-danger-surface border border-danger-border';
    case 'vm_migration':
      return 'bg-[rgb(var(--c-primary-hover)/0.1)] border border-primary-dark';
    case 'vm_started':
      return 'bg-success-surface border border-success-border';
    default:
      return 'bg-surface-sunken border border-border';
  }
};

const getEventIcon = (event: MigrationEvent) => {
  if (!event.success) return XCircle;

  switch (event.type) {
    case 'vm_migration':
      return RefreshCw;
    case 'vm_shutdown':
      return StopCircle;
    case 'vm_started':
      return PlayCircle;
    case 'server_shutdown':
      return Server;
    case 'grace_period':
      return Clock;
    case 'start_shutdown':
      return StopCircle;
    case 'finish_shutdown':
      return CheckCircle;
    default:
      return event.success ? CheckCircle : XCircle;
  }
};

const getEventTitle = (event: MigrationEvent) => {
  switch (event.type) {
    case 'vm_migration':
      return t('migration.status.vm_migration', {
        name: event.vmName || 'Unknown',
      });
    case 'vm_shutdown':
      return t('migration.status.vm_shutdown', {
        name: event.vmName || 'Unknown',
      });
    case 'vm_started':
      return t('migration.status.vm_started', {
        name: event.vmName || 'Unknown',
      });
    case 'server_shutdown':
      return t('migration.status.server_shutdown', {
        name: event.serverName || 'Unknown',
      });
    case 'grace_period':
      return t('migration.status.grace_period');
    case 'start_shutdown':
      return t('migration.status.start_shutdown');
    case 'finish_shutdown':
      return t('migration.status.finish_shutdown');
    default:
      return t('migration.status.unknown_event');
  }
};

const getEventDescription = (event: MigrationEvent) => {
  switch (event.type) {
    case 'vm_migration':
      if (event.sourceMoid && event.destinationMoid) {
        return t('migration.status.vm_migration_desc', {
          source: event.sourceMoid,
          destination: event.destinationMoid,
        });
      }
      return '';
    case 'vm_shutdown':
      return event.vmMoid
        ? t('migration.status.vm_shutdown_desc', { moid: event.vmMoid })
        : '';
    case 'server_shutdown':
      return event.serverMoid
        ? t('migration.status.server_shutdown_desc', { moid: event.serverMoid })
        : '';
    default:
      return '';
  }
};

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString();
};

const formatDateTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString();
};

const getEventIconColor = (event: MigrationEvent) => {
  if (!event.success) return 'text-danger-text';

  switch (event.type) {
    case 'grace_period':
      return 'text-warning-text';
    case 'vm_shutdown':
    case 'server_shutdown':
      return 'text-danger-text';
    case 'vm_migration':
      return 'text-primary-text';
    case 'vm_started':
      return 'text-success-text';
    case 'start_shutdown':
    case 'finish_shutdown':
      return 'text-text';
    default:
      return 'text-text';
  }
};

const handleClearEvents = async () => {
  const confirmed = await confirm({
    title: t('migration.status.confirm_clear_title'),
    message: t('migration.status.confirm_clear_message'),
    confirmText: t('migration.status.confirm_clear_button'),
    confirmButtonClass: 'bg-danger-solid hover:bg-danger-solid text-white',
  });

  if (confirmed) {
    try {
      await migrationStore.clearMigrationData();
      showToast(t('migration.status.clear_success'), 'success');
    } catch (error) {
      showToast(t('migration.status.clear_error'), 'error');
    }
  }
};
</script>
