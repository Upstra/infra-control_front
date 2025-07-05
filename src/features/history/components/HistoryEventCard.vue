<script setup lang="ts">
import { computed } from 'vue';
import type { HistoryEvent } from '../types';
import { entityToPath } from '../types';
import { RouterLink } from 'vue-router';

const props = defineProps<{
  event: HistoryEvent;
}>();

const emit = defineEmits<{
  showDetail: [event: HistoryEvent];
}>();

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('default', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getUserDisplay = (event: HistoryEvent) => {
  if (event.user) {
    const { email, firstName, lastName } = event.user;
    if (firstName || lastName) {
      const fullName = `${firstName || ''} ${lastName || ''}`.trim();
      return fullName;
    }
    return email;
  }
  return event.metadata?.userEmail || 'Unknown User';
};

const getEntityIcon = (entity: string) => {
  const icons: Record<string, string> = {
    server: '🖥️',
    vm: '☁️',
    user: '👤',
    room: '🏢',
    ups: '🔋',
    group: '📁',
    auth: '🔐',
    user_role: '👥',
  };
  return icons[entity] || '📄';
};

const getActionBadgeColor = (action: string) => {
  if (action.includes('CREATE'))
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  if (action.includes('UPDATE'))
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  if (action.includes('DELETE'))
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  if (action.includes('FAILED'))
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  if (action.includes('START') || action.includes('RESTART'))
    return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
  if (action.includes('SHUTDOWN'))
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
};

const hasEntityLink = computed(() => {
  return (
    entityToPath[props.event.entity] &&
    props.event.entityId &&
    props.event.entityId !== 'unknown'
  );
});

const getQuickInfo = (event: HistoryEvent) => {
  const { entity, action, metadata, newValue } = event;

  if (entity === 'auth' && action === 'LOGIN_FAILED' && metadata?.reason) {
    return metadata.reason;
  }

  if ((entity === 'server' || entity === 'vm') && newValue?.name) {
    return newValue.name;
  }

  if (entity === 'user_role' && metadata?.targetRoleName) {
    return metadata.targetRoleName;
  }

  if (metadata?.identifier) {
    return metadata.identifier;
  }

  return null;
};
</script>

<template>
  <div class="history-event-card group">
    <div class="flex items-start gap-4">
      <div class="flex-shrink-0">
        <div class="event-timeline-dot">
          <span class="text-lg">{{ getEntityIcon(event.entity) }}</span>
        </div>
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatTime(event.createdAt) }}
              </span>
              <span
                class="action-badge text-xs px-2 py-0.5 rounded-full font-medium"
                :class="getActionBadgeColor(event.action)"
              >
                {{ event.action }}
              </span>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-medium text-gray-900 dark:text-white">
                {{ getUserDisplay(event) }}
              </span>
              <span class="text-gray-500 dark:text-gray-400">
                {{ event.action.toLowerCase().replace(/_/g, ' ') }}
              </span>
              <RouterLink
                v-if="hasEntityLink"
                :to="`/${entityToPath[event.entity]}/${event.entityId}`"
                class="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {{ event.entity }} #{{ event.entityId }}
              </RouterLink>
              <span v-else class="text-gray-700 dark:text-gray-300">
                {{ event.entity }}
              </span>
            </div>

            <div v-if="getQuickInfo(event)" class="mt-1">
              <span class="text-sm text-gray-600 dark:text-gray-400 italic">
                "{{ getQuickInfo(event) }}"
              </span>
            </div>
          </div>

          <button
            v-if="event.metadata || event.oldValue || event.newValue"
            @click="emit('showDetail', event)"
            class="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg
              class="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
          </button>
        </div>

        <div
          v-if="event.ipAddress"
          class="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400"
        >
          <span class="flex items-center gap-1">
            <svg
              class="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              ></path>
            </svg>
            {{ event.ipAddress }}
          </span>
          <span v-if="event.userAgent" class="flex items-center gap-1">
            <svg
              class="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              ></path>
            </svg>
            {{ event.userAgent.split(' ')[0] }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-event-card {
  @apply bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-neutral-700;
  @apply hover:shadow-md transition-all duration-200 hover:border-gray-300 dark:hover:border-neutral-600;
}

.event-timeline-dot {
  @apply w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-700 flex items-center justify-center;
  @apply border-2 border-gray-200 dark:border-neutral-600;
}

.action-badge {
  @apply inline-flex items-center;
}
</style>
