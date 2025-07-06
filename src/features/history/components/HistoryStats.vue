<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useHistoryStore } from '../store';
import { useI18n } from 'vue-i18n';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut, Bar } from 'vue-chartjs';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const { t, locale } = useI18n();
const historyStore = useHistoryStore();

onMounted(async () => {
  await historyStore.fetchStats();
});

const stats = computed(() => historyStore.stats);
const loading = computed(() => historyStore.statsLoading);

const actionStats = computed(() => {
  if (!stats.value) return [];
  return Object.entries(stats.value.eventsByAction)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
});

const topUser = computed(() => {
  if (!stats.value || stats.value.topUsers.length === 0) return null;
  return stats.value.topUsers[0];
});

const topAction = computed(() => {
  if (!actionStats.value.length) return null;
  return actionStats.value[0];
});

const entityChartData = computed(() => {
  if (!stats.value) return { labels: [], datasets: [] };

  return {
    labels: Object.keys(stats.value.eventsByEntity),
    datasets: [
      {
        data: Object.values(stats.value.eventsByEntity),
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#ec4899',
          '#06b6d4',
          '#14b8a6',
          '#f97316',
        ],
        borderWidth: 0,
      },
    ],
  };
});

const activityChartData = computed(() => {
  if (!stats.value) return { labels: [], datasets: [] };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const currentLocale = locale.value === 'fr' ? 'fr-FR' : 'en-US';
    return date.toLocaleDateString(currentLocale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return {
    labels: stats.value.activityTrends.map((trend) => formatDate(trend.date)),
    datasets: [
      {
        label: t('history.stats.events'),
        data: stats.value.activityTrends.map((trend) => trend.count),
        backgroundColor: '#3b82f6',
        borderRadius: 4,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        padding: 10,
        font: {
          size: 12,
        },
      },
    },
  },
};
</script>

<template>
  <div class="history-stats-wrapper">
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"
      ></div>
    </div>

    <template v-else-if="stats">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="stat-card">
          <div class="stat-icon bg-blue-100 dark:bg-blue-900/30">
            <svg
              class="w-6 h-6 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              ></path>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{ stats.totalEvents }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ t('history.stats.total_events') }}
            </p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-green-100 dark:bg-green-900/30">
            <svg
              class="w-6 h-6 text-green-600 dark:text-green-400"
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
          <div>
            <p class="text-lg font-bold text-gray-900 dark:text-white truncate">
              {{ topUser?.username || 'N/A' }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ t('history.stats.mostActiveUser') }}
            </p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-purple-100 dark:bg-purple-900/30">
            <svg
              class="w-6 h-6 text-purple-600 dark:text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              ></path>
            </svg>
          </div>
          <div>
            <p class="text-lg font-bold text-gray-900 dark:text-white">
              {{ topAction?.[0] || 'N/A' }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ t('history.stats.topAction') }}
            </p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-orange-100 dark:bg-orange-900/30">
            <svg
              class="w-6 h-6 text-orange-600 dark:text-orange-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {{
                stats.activityTrends.find((t) => {
                  const today = new Date();
                  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                  return t.date === todayStr;
                })?.count || 0
              }}
            </p>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ t('history.stats.todaysEvents') }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div
          class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-6"
        >
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {{ t('history.stats.eventsByEntity') }}
          </h3>
          <div class="h-64">
            <Doughnut :data="entityChartData" :options="doughnutOptions" />
          </div>
        </div>

        <div
          class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-6"
        >
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {{ t('history.stats.activityTrend') }}
          </h3>
          <div class="h-64">
            <Bar :data="activityChartData" :options="chartOptions" />
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-6"
        >
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {{ t('history.stats.topActions') }}
          </h3>
          <div class="space-y-2">
            <div
              v-for="[action, count] in actionStats"
              :key="action"
              class="flex items-center justify-between"
            >
              <span class="text-sm text-gray-700 dark:text-gray-300">{{
                action
              }}</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                count
              }}</span>
            </div>
          </div>
        </div>

        <div
          class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-6"
        >
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {{ t('history.stats.mostActiveUsers') }}
          </h3>
          <div class="space-y-2">
            <div
              v-for="user in stats.topUsers.slice(0, 5)"
              :key="user.userId"
              class="flex items-center justify-between"
            >
              <span class="text-sm text-gray-700 dark:text-gray-300 truncate">{{
                user.username
              }}</span>
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                user.count
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.stat-card {
  @apply bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-4;
  @apply flex items-center gap-4;
}

.stat-icon {
  @apply w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0;
}
</style>
