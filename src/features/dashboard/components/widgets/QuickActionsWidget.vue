<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import BaseWidget from './BaseWidget.vue';
import type { WidgetConfig } from '../../types/widget';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  config: WidgetConfig;
}>();

const router = useRouter();
const { t } = useI18n();

const defaultActions = [
  {
    id: 'add-server',
    label: t('dashboard.add_server'),
    icon: 'server-plus',
    route: '/servers',
    color: 'blue',
  },
  {
    id: 'view-alerts',
    label: t('dashboard.view_alerts'),
    icon: 'bell',
    route: '/alerts',
    color: 'red',
  },
  {
    id: 'manage-users',
    label: t('dashboard.manage_users'),
    icon: 'users',
    route: '/users',
    color: 'purple',
  },
  {
    id: 'view-ups',
    label: t('dashboard.view_ups'),
    icon: 'battery',
    route: '/ups',
    color: 'orange',
  },
  {
    id: 'rooms',
    label: t('dashboard.rooms'),
    icon: 'building',
    route: '/rooms',
    color: 'green',
  },
  {
    id: 'groups',
    label: t('dashboard.groups'),
    icon: 'collection',
    route: '/groups',
    color: 'indigo',
  },
];

const actions = computed(() => {
  if (props.config.settings?.selectedActions) {
    return defaultActions.filter(action => 
      props.config.settings.selectedActions.includes(action.id)
    );
  }
  return defaultActions;
});

const navigateTo = (route: string) => {
  router.push(route);
};
</script>

<template>
  <BaseWidget :config="config">
    <div class="grid grid-cols-2 gap-3">
      <button
        v-for="action in actions"
        :key="action.id"
        @click="navigateTo(action.route)"
        class="action-button"
        :class="`action-${action.color}`"
      >
        <div class="action-icon">
          <svg v-if="action.icon === 'server-plus'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5v14"></path>
          </svg>
          <svg v-else-if="action.icon === 'bell'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
          <svg v-else-if="action.icon === 'users'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
          <svg v-else-if="action.icon === 'battery'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
          <svg v-else-if="action.icon === 'building'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          <svg v-else-if="action.icon === 'collection'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
        </div>
        <span class="action-label">{{ action.label }}</span>
      </button>
    </div>
  </BaseWidget>
</template>

<style scoped>
.action-button {
  @apply p-4 rounded-lg flex flex-col items-center gap-2 transition-all hover:scale-105 hover:shadow-lg;
}

.action-icon {
  @apply p-3 rounded-full;
}

.action-label {
  @apply text-sm font-medium text-gray-700 dark:text-gray-300;
}

.action-blue {
  @apply bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30;
}

.action-blue .action-icon {
  @apply bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400;
}

.action-red {
  @apply bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30;
}

.action-red .action-icon {
  @apply bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400;
}

.action-purple {
  @apply bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30;
}

.action-purple .action-icon {
  @apply bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400;
}

.action-orange {
  @apply bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30;
}

.action-orange .action-icon {
  @apply bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400;
}

.action-green {
  @apply bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30;
}

.action-green .action-icon {
  @apply bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400;
}

.action-indigo {
  @apply bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30;
}

.action-indigo .action-icon {
  @apply bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400;
}
</style>