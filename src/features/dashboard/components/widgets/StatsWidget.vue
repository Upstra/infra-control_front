<script setup lang="ts">
import { computed } from 'vue';
import BaseWidget from './BaseWidget.vue';
import type { WidgetConfig } from '../../types/widget';
import { useWidget } from '../../composables/useWidget';
import { dashboardApi } from '../../api';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  config: WidgetConfig;
}>();

const { t } = useI18n();

const { widgetData, refresh } = useWidget(props.config, async () => {
  return await dashboardApi.getStats();
});

const stats = computed(() => widgetData.value.data);

const statItems = computed(() => {
  if (!stats.value) return [];

  const items = [
    {
      label: t('dashboard.users'),
      value: stats.value.totalUsers,
      icon: 'users',
      color: 'blue',
    },
    {
      label: t('dashboard.servers'),
      value: stats.value.totalServers,
      icon: 'server',
      color: 'green',
    },
    {
      label: t('dashboard.rooms'),
      value: stats.value.totalRooms,
      icon: 'building',
      color: 'purple',
    },
    {
      label: t('dashboard.ups'),
      value: stats.value.totalUps,
      icon: 'battery',
      color: 'orange',
    },
    {
      label: t('dashboard.vms'),
      value: stats.value.totalVms,
      icon: 'cloud',
      color: 'indigo',
    },
    {
      label: t('dashboard.online_users'),
      value: stats.value.onlineUsers,
      icon: 'status',
      color: 'emerald',
    },
  ];

  return props.config.settings?.selectedStats
    ? items.filter((item) =>
        props.config.settings?.selectedStats.includes(item.label),
      )
    : items;
});
</script>

<template>
  <BaseWidget
    :config="config"
    :loading="widgetData.loading"
    :error="widgetData.error"
    @refresh="refresh"
  >
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div
        v-for="stat in statItems"
        :key="stat.label"
        class="stat-item"
        :class="`stat-${stat.color}`"
      >
        <div class="stat-icon">
          <svg
            v-if="stat.icon === 'users'"
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            ></path>
          </svg>
          <svg
            v-else-if="stat.icon === 'server'"
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
            ></path>
          </svg>
          <svg
            v-else-if="stat.icon === 'building'"
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            ></path>
          </svg>
          <svg
            v-else-if="stat.icon === 'battery'"
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            ></path>
          </svg>
          <svg
            v-else-if="stat.icon === 'cloud'"
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
            ></path>
          </svg>
          <svg
            v-else-if="stat.icon === 'status'"
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z"
            ></path>
          </svg>
        </div>
        <div class="stat-content">
          <p class="stat-label">{{ stat.label }}</p>
          <p class="stat-value">{{ stat.value }}</p>
        </div>
      </div>
    </div>
  </BaseWidget>
</template>

<style scoped>
.stat-item {
  @apply bg-gray-50 dark:bg-neutral-700 rounded-lg p-4 flex items-center space-x-3 transition-all hover:scale-105;
}

.stat-icon {
  @apply p-3 rounded-lg;
}

.stat-content {
  @apply flex-1;
}

.stat-label {
  @apply text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider;
}

.stat-value {
  @apply text-2xl font-bold text-gray-900 dark:text-white;
}

.stat-blue .stat-icon {
  @apply bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400;
}

.stat-green .stat-icon {
  @apply bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400;
}

.stat-purple .stat-icon {
  @apply bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400;
}

.stat-orange .stat-icon {
  @apply bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400;
}

.stat-indigo .stat-icon {
  @apply bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400;
}

.stat-emerald .stat-icon {
  @apply bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400;
}
</style>
