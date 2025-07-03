<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { HistoryEvent } from '../types';
import { actionStyles } from '../types';

interface Props {
  event: HistoryEvent;
}

const props = defineProps<Props>();
const { t } = useI18n();

const actionStyle = computed(() => {
  return (
    actionStyles[props.event.action] || { color: 'text-gray-600', icon: '📝' }
  );
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const formatJson = (data: any) => {
  if (!data) return null;
  return JSON.stringify(data, null, 2);
};

const hasChanges = computed(() => {
  return props.event.oldValue || props.event.newValue;
});

const getChangedFields = computed(() => {
  if (!props.event.oldValue || !props.event.newValue) return [];

  const changes: Array<{ field: string; old: any; new: any }> = [];
  const allKeys = new Set([
    ...Object.keys(props.event.oldValue || {}),
    ...Object.keys(props.event.newValue || {}),
  ]);

  allKeys.forEach((key) => {
    const oldVal = props.event.oldValue?.[key];
    const newVal = props.event.newValue?.[key];

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push({ field: key, old: oldVal, new: newVal });
    }
  });

  return changes;
});

const getActionDescription = computed(() => {
  const { entity, action, metadata } = props.event;

  if (entity === 'auth') {
    switch (action) {
      case 'LOGIN_SUCCESS':
        return {
          title: t('history.actions.login_success'),
          description: t('history.descriptions.login_success', {
            method: metadata?.loginMethod || 'email',
            email:
              metadata?.userEmail ||
              props.event.user?.email ||
              props.event.userId,
          }),
        };
      case 'LOGIN_FAILED':
        return {
          title: t('history.actions.login_failed'),
          description: t('history.descriptions.login_failed', {
            reason: metadata?.reason || 'unknown',
            identifier: metadata?.identifier || 'unknown',
          }),
        };
      case 'LOGIN_2FA_REQUIRED':
        return {
          title: t('history.actions.login_2fa_required'),
          description: t('history.descriptions.login_2fa_required'),
        };
      case 'REGISTER_SUCCESS':
        return {
          title: t('history.actions.register_success'),
          description: t('history.descriptions.register_success', {
            email: metadata?.userEmail || 'unknown',
          }),
        };
    }
  }

  if (entity === 'server') {
    switch (action) {
      case 'CREATE':
        return {
          title: t('history.actions.server_created'),
          description: t('history.descriptions.server_created', {
            hostname: props.event.newValue?.hostname || metadata?.hostname,
            room: props.event.newValue?.roomName || 'unknown',
          }),
        };
      case 'START':
        return {
          title: t('history.actions.server_started'),
          description: t('history.descriptions.server_started'),
        };
      case 'SHUTDOWN':
        return {
          title: t('history.actions.server_shutdown'),
          description: t('history.descriptions.server_shutdown'),
        };
    }
  }

  if (entity === 'vm') {
    switch (action) {
      case 'CREATE':
        return {
          title: t('history.actions.vm_created'),
          description: t('history.descriptions.vm_created', {
            name: props.event.newValue?.name,
            server:
              props.event.newValue?.serverHostname || metadata?.parentServer,
          }),
        };
    }
  }

  if (entity === 'user_role') {
    switch (action) {
      case 'UPDATE_ROLE':
        const opType = metadata?.operationType;
        if (opType === 'ADD_ROLE') {
          return {
            title: t('history.actions.role_added'),
            description: t('history.descriptions.role_added', {
              role: metadata?.targetRoleName,
              admin: metadata?.targetRoleIsAdmin
                ? t('common.yes')
                : t('common.no'),
            }),
          };
        } else if (opType === 'REMOVE_ROLE') {
          return {
            title: t('history.actions.role_removed'),
            description: t('history.descriptions.role_removed', {
              role: metadata?.targetRoleName,
            }),
          };
        }
    }
  }

  return {
    title: `${entity} - ${action}`,
    description: t('history.descriptions.default', { entity, action }),
  };
});

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? '✓' : '✗';
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value
        .map((v) => (typeof v === 'object' ? v.name || JSON.stringify(v) : v))
        .join(', ');
    }
    return JSON.stringify(value, null, 2);
  }
  return String(value);
};

const getUserDisplayName = () => {
  if (props.event.user) {
    const { email, username, firstName, lastName } = props.event.user;
    if (firstName || lastName) {
      const fullName = `${firstName || ''} ${lastName || ''}`.trim();
      return `${fullName} (${email})`;
    }
    return email || username;
  }
  return props.event.userId || '-';
};

const getContextualDetails = computed(() => {
  const details: Array<{ label: string; value: any }> = [];
  const { metadata, entity } = props.event;

  if (!metadata && !props.event.ipAddress) return details;

  if (props.event.ipAddress) {
    details.push({
      label: t('history.details.ip_address'),
      value: props.event.ipAddress,
    });
  }

  if (metadata) {
    if (entity === 'auth') {
      if (metadata.loginMethod) {
        details.push({
          label: t('history.details.login_method'),
          value: metadata.loginMethod,
        });
      }
      if (metadata.requires2FA !== undefined) {
        details.push({
          label: t('history.details.requires_2fa'),
          value: metadata.requires2FA,
        });
      }
    }

    if (entity === 'server' || entity === 'vm') {
      if (metadata.serverType) {
        details.push({
          label: t('history.details.server_type'),
          value: metadata.serverType,
        });
      }
      if (metadata.operatingSystem) {
        details.push({
          label: t('history.details.os'),
          value: metadata.operatingSystem,
        });
      }
      if (metadata.assignedToGroup !== undefined) {
        details.push({
          label: t('history.details.assigned_to_group'),
          value: metadata.assignedToGroup,
        });
      }
    }

    if (entity === 'user_role') {
      if (metadata.previousRoleCount !== undefined) {
        details.push({
          label: t('history.details.role_count'),
          value: `${metadata.previousRoleCount} → ${metadata.newRoleCount}`,
        });
      }
      if (metadata.isElevationToAdmin) {
        details.push({
          label: t('history.details.admin_elevation'),
          value: true,
        });
      }
      if (metadata.isRemovalFromAdmin) {
        details.push({
          label: t('history.details.admin_removal'),
          value: true,
        });
      }
    }
  }

  return details;
});
</script>

<template>
  <div
    class="space-y-4 p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-lg max-w-5xl"
  >
    <div
      class="flex items-start gap-4 pb-4 border-b border-gray-200 dark:border-neutral-700"
    >
      <div
        class="flex-shrink-0 p-3 rounded-full bg-gray-100 dark:bg-neutral-700"
      >
        <span class="text-3xl">{{ actionStyle.icon }}</span>
      </div>
      <div class="flex-1">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ getActionDescription.title }}
        </h3>
        <p class="mt-1 text-gray-600 dark:text-gray-400">
          {{ getActionDescription.description }}
        </p>
        <div
          class="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400"
        >
          <span>{{ formatDate(event.createdAt) }}</span>
          <span
            v-if="event.userId || event.user"
            class="flex items-center gap-1"
          >
            <svg
              class="w-4 h-4"
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
            {{ getUserDisplayName() }}
          </span>
        </div>
      </div>
      <span
        :class="actionStyle.color"
        class="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 dark:bg-neutral-700"
      >
        {{ event.action }}
      </span>
    </div>

    <div
      v-if="event.user"
      class="bg-gray-50 dark:bg-neutral-900 rounded-lg p-4"
    >
      <h4
        class="font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"
      >
        <svg
          class="w-5 h-5"
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
        {{ t('history.details.performed_by') }}
      </h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="flex justify-between">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400"
            >{{ t('history.details.user_email') }}:</span
          >
          <span class="text-sm text-gray-900 dark:text-white">{{
            event.user.email
          }}</span>
        </div>
        <div v-if="event.user.username" class="flex justify-between">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400"
            >{{ t('history.details.username') }}:</span
          >
          <span class="text-sm text-gray-900 dark:text-white">{{
            event.user.username
          }}</span>
        </div>
        <div
          v-if="event.user.firstName || event.user.lastName"
          class="flex justify-between"
        >
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400"
            >{{ t('history.details.full_name') }}:</span
          >
          <span class="text-sm text-gray-900 dark:text-white">
            {{ event.user.firstName }} {{ event.user.lastName }}
          </span>
        </div>
        <div
          v-if="event.user.roles && event.user.roles.length > 0"
          class="flex justify-between"
        >
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400"
            >{{ t('history.details.user_roles') }}:</span
          >
          <span class="text-sm text-gray-900 dark:text-white">
            <span v-for="(role, idx) in event.user.roles" :key="role.id">
              {{ role.name
              }}<span
                v-if="role.isAdmin"
                class="text-yellow-600 dark:text-yellow-400"
              >
                ★</span
              ><span v-if="idx < event.user.roles.length - 1">, </span>
            </span>
          </span>
        </div>
        <div class="flex justify-between">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400"
            >{{ t('history.details.user_active') }}:</span
          >
          <span class="text-sm">
            <span
              v-if="event.user.active"
              class="text-green-600 dark:text-green-400"
              >✓ {{ t('common.yes') }}</span
            >
            <span v-else class="text-red-600 dark:text-red-400"
              >✗ {{ t('common.no') }}</span
            >
          </span>
        </div>
      </div>
    </div>

    <div
      v-if="getContextualDetails.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <div
        v-for="detail in getContextualDetails"
        :key="detail.label"
        class="flex justify-between p-3 bg-gray-50 dark:bg-neutral-900 rounded-lg"
      >
        <span class="text-sm font-medium text-gray-600 dark:text-gray-400"
          >{{ detail.label }}:</span
        >
        <span class="text-sm text-gray-900 dark:text-white font-medium">
          <span v-if="typeof detail.value === 'boolean'">
            <span v-if="detail.value" class="text-green-600"
              >✓ {{ t('common.yes') }}</span
            >
            <span v-else class="text-red-600">✗ {{ t('common.no') }}</span>
          </span>
          <span v-else>{{ formatValue(detail.value) }}</span>
        </span>
      </div>
    </div>

    <div v-if="hasChanges" class="space-y-3">
      <h4
        class="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
      >
        <svg
          class="w-5 h-5"
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
        {{ t('administration.history_details.changes') }}
      </h4>

      <div class="space-y-3">
        <div
          v-for="change in getChangedFields"
          :key="change.field"
          class="border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden"
        >
          <div class="bg-gray-50 dark:bg-neutral-900 px-4 py-2">
            <h5 class="font-medium text-gray-800 dark:text-gray-200">
              {{
                change.field
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())
              }}
            </h5>
          </div>

          <div
            class="grid grid-cols-1 md:grid-cols-2 divide-x divide-gray-200 dark:divide-neutral-700"
          >
            <div class="p-4">
              <p
                class="text-xs font-medium text-red-600 dark:text-red-400 mb-2"
              >
                {{ t('administration.history_details.old_value') }}
              </p>
              <div class="text-sm text-gray-700 dark:text-gray-300">
                <pre
                  v-if="typeof change.old === 'object' && change.old !== null"
                  class="text-xs bg-gray-100 dark:bg-neutral-800 p-2 rounded overflow-x-auto"
                  >{{ formatJson(change.old) }}</pre
                >
                <span v-else>{{ formatValue(change.old) }}</span>
              </div>
            </div>

            <div class="p-4">
              <p
                class="text-xs font-medium text-green-600 dark:text-green-400 mb-2"
              >
                {{ t('administration.history_details.new_value') }}
              </p>
              <div class="text-sm text-gray-700 dark:text-gray-300">
                <pre
                  v-if="typeof change.new === 'object' && change.new !== null"
                  class="text-xs bg-gray-100 dark:bg-neutral-800 p-2 rounded overflow-x-auto"
                  >{{ formatJson(change.new) }}</pre
                >
                <span v-else>{{ formatValue(change.new) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="event.metadata && Object.keys(event.metadata).length > 0"
      class="space-y-3"
    >
      <h4
        class="font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        {{ t('administration.history_details.metadata') }}
      </h4>
      <div class="bg-gray-50 dark:bg-neutral-900 rounded-lg p-4">
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <template v-for="(value, key) in event.metadata" :key="String(key)">
            <div
              v-if="
                ![
                  'userEmail',
                  'identifier',
                  'loginMethod',
                  'requires2FA',
                  'operationType',
                  'targetRoleName',
                  'targetRoleIsAdmin',
                  'previousRoleCount',
                  'newRoleCount',
                  'isElevationToAdmin',
                  'isRemovalFromAdmin',
                  'serverType',
                  'operatingSystem',
                  'assignedToGroup',
                ].includes(String(key))
              "
              class="flex justify-between"
            >
              <dt class="text-sm font-medium text-gray-600 dark:text-gray-400">
                {{
                  String(key)
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (l) => l.toUpperCase())
                }}:
              </dt>
              <dd class="text-sm text-gray-900 dark:text-white">
                {{ formatValue(value) }}
              </dd>
            </div>
          </template>
        </dl>
      </div>
    </div>

    <div
      v-if="event.userAgent || event.correlationId"
      class="pt-4 border-t border-gray-200 dark:border-neutral-700 space-y-2"
    >
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {{ t('history.details.technical_info') }}
      </h4>
      <div class="space-y-1 text-xs text-gray-500 dark:text-gray-400 font-mono">
        <p v-if="event.userAgent">
          <span class="font-medium">User Agent:</span> {{ event.userAgent }}
        </p>
        <p v-if="event.correlationId">
          <span class="font-medium">Correlation ID:</span>
          {{ event.correlationId }}
        </p>
      </div>
    </div>
  </div>
</template>
