<template>
  <div class="history-table-container">
    <div
      class="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 md:rounded-lg dark:bg-gray-800 dark:ring-gray-700"
    >
      <table class="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300"
            >
              {{ $t('administration.history_details.headers.date') }}
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300"
            >
              {{ $t('administration.history_details.headers.user') }}
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300"
            >
              {{ $t('administration.history_details.headers.action') }}
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300"
            >
              {{ $t('administration.history_details.headers.entity') }}
            </th>
            <th
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300"
            >
              {{ $t('common.details') }}
            </th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody
          class="divide-y divide-gray-200 bg-white dark:divide-gray-600 dark:bg-gray-800"
        >
          <tr
            v-for="event in events"
            :key="event.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            @click="$emit('show-detail', event)"
          >
            <td
              class="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white"
            >
              <div class="flex flex-col">
                <span class="font-medium">{{
                  formatDate(event.createdAt)
                }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-400">{{
                  formatTime(event.createdAt)
                }}</span>
              </div>
            </td>

            <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-8 w-8">
                  <div
                    class="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center"
                  >
                    <svg
                      class="h-4 w-4 text-indigo-600 dark:text-indigo-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      ></path>
                    </svg>
                  </div>
                </div>
                <div class="ml-3">
                  <div class="text-sm font-medium">
                    {{ getUserDisplayName(event) }}
                  </div>
                  <div
                    v-if="event.user?.email"
                    class="text-xs text-gray-500 dark:text-gray-400"
                  >
                    {{ event.user.email }}
                  </div>
                </div>
              </div>
            </td>

            <td class="px-6 py-4 text-sm">
              <div class="flex items-center">
                <span class="text-xl mr-2">{{
                  getActionIcon(event.action)
                }}</span>
                <div>
                  <span
                    :class="getActionColor(event.action)"
                    class="font-medium"
                  >
                    {{ getActionTitle(event) }}
                  </span>
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ event.action }}
                  </div>
                </div>
              </div>
            </td>

            <td class="px-6 py-4 text-sm">
              <div class="flex items-center">
                <span class="text-lg mr-2">{{
                  getEntityIcon(event.entity)
                }}</span>
                <div>
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ getEntityName(event.entity) }}
                  </span>
                  <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {{ event.entityId }}
                  </div>
                </div>
              </div>
            </td>

            <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
              <div class="max-w-xs truncate">
                {{ getEventDescription(event) }}
              </div>
              <div v-if="event.ipAddress" class="text-xs mt-1">
                IP: {{ event.ipAddress }}
              </div>
            </td>

            <td
              class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
            >
              <button
                @click.stop="$emit('show-detail', event)"
                class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                {{ $t('common.view_details') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="hasMore" class="mt-6 text-center">
      <button
        @click="$emit('load-more')"
        :disabled="loading"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          v-if="loading"
          class="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        {{ loading ? $t('common.loading') : $t('common.loadMore') }}
      </button>
    </div>

    <div v-if="events.length === 0 && !loading" class="text-center py-12">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        ></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">
        {{ $t('administration.history_details.empty') }}
      </h3>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { HistoryEvent } from '../types';
import { actionStyles } from '../types';

interface Props {
  events: HistoryEvent[];
  loading?: boolean;
  hasMore?: boolean;
}

defineProps<Props>();
defineEmits<{
  'show-detail': [event: HistoryEvent];
  'load-more': [];
}>();

const { t } = useI18n();

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString();
};

const getUserDisplayName = (event: HistoryEvent) => {
  if (event.user) {
    const { email, username, firstName, lastName } = event.user;
    if (firstName || lastName) {
      const fullName = `${firstName || ''} ${lastName || ''}`.trim();
      return fullName;
    }
    return username || email;
  }
  return event.userId || 'System';
};

const getActionIcon = (action: string) => {
  return actionStyles[action]?.icon || '📝';
};

const getActionColor = (action: string) => {
  return actionStyles[action]?.color || 'text-gray-600';
};

const getActionTitle = (event: HistoryEvent) => {
  const { entity, action, metadata } = event;

  if (entity === 'permission_server') {
    switch (action) {
      case 'CREATE':
        return t('history.actions.permission_server_created');
      case 'UPDATE':
        return t('history.actions.permission_server_updated');
      case 'DELETE':
        return t('history.actions.permission_server_deleted');
    }
  }

  if (entity === 'permission_vm') {
    switch (action) {
      case 'CREATE':
        return t('history.actions.permission_vm_created');
      case 'UPDATE':
        return t('history.actions.permission_vm_updated');
      case 'DELETE':
        return t('history.actions.permission_vm_deleted');
    }
  }

  if (entity === 'auth') {
    switch (action) {
      case 'LOGIN_SUCCESS':
        return t('history.actions.login_success');
      case 'LOGIN_FAILED':
        return t('history.actions.login_failed');
      case 'LOGIN_2FA_REQUIRED':
        return t('history.actions.login_2fa_required');
      case 'REGISTER_SUCCESS':
        return t('history.actions.register_success');
    }
  }

  if (entity === 'server') {
    switch (action) {
      case 'CREATE':
        return t('history.actions.server_created');
      case 'START':
        return t('history.actions.server_started');
      case 'SHUTDOWN':
        return t('history.actions.server_shutdown');
    }
  }

  if (entity === 'vm') {
    switch (action) {
      case 'CREATE':
        return t('history.actions.vm_created');
    }
  }

  if (entity === 'user_role') {
    const opType = metadata?.operationType;
    if (opType === 'ADD_ROLE') {
      return t('history.actions.role_added');
    } else if (opType === 'REMOVE_ROLE') {
      return t('history.actions.role_removed');
    }
  }

  return `${entity} ${action}`;
};

const getEntityIcon = (entity: string) => {
  const entityIcons = {
    auth: '🔐',
    user: '👤',
    server: '🖥️',
    vm: '💻',
    room: '🏢',
    ups: '🔋',
    role: '👑',
    group: '👥',
    user_role: '🎭',
    permission_server: '🔑',
    permission_vm: '🗝️',
  };
  return entityIcons[entity as keyof typeof entityIcons] || '📄';
};

const getEntityName = (entity: string) => {
  try {
    return t(`history.entities.${entity}`);
  } catch {
    return entity.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  }
};

const getEventDescription = (event: HistoryEvent) => {
  const { entity, action, metadata, oldValue, newValue } = event;

  if (entity === 'permission_server') {
    if (
      action === 'UPDATE' &&
      oldValue?.bitmask !== undefined &&
      newValue?.bitmask !== undefined
    ) {
      return `Bitmask: ${oldValue.bitmask} → ${newValue.bitmask}`;
    }
    if (action === 'CREATE' && newValue?.bitmask !== undefined) {
      return `Bitmask: ${newValue.bitmask}`;
    }
  }

  if (entity === 'permission_vm') {
    if (
      action === 'UPDATE' &&
      oldValue?.bitmask !== undefined &&
      newValue?.bitmask !== undefined
    ) {
      return `Bitmask: ${oldValue.bitmask} → ${newValue.bitmask}`;
    }
    if (action === 'CREATE' && newValue?.bitmask !== undefined) {
      return `Bitmask: ${newValue.bitmask}`;
    }
  }

  if (entity === 'auth') {
    if (action === 'LOGIN_FAILED' && metadata?.reason) {
      return `Reason: ${metadata.reason}`;
    }
    if (metadata?.loginMethod) {
      return `Method: ${metadata.loginMethod}`;
    }
  }

  if (entity === 'server') {
    if (newValue?.hostname || metadata?.hostname) {
      return newValue?.hostname || metadata?.hostname;
    }
  }

  if (entity === 'vm') {
    if (newValue?.name) {
      return newValue.name;
    }
  }

  if (entity === 'user_role') {
    if (metadata?.targetRoleName) {
      return metadata.targetRoleName;
    }
  }

  return event.entityId || '-';
};
</script>

<style scoped>
.history-table-container {
  @apply space-y-4;
}
</style>
