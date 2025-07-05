<script setup lang="ts">
import { computed } from 'vue';
import type { HistoryEvent } from '../types';
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

const props = defineProps<{
  events: HistoryEvent[];
}>();

const actionStats = computed(() => {
  const stats: Record<string, number> = {};
  props.events.forEach((event) => {
    stats[event.action] = (stats[event.action] || 0) + 1;
  });
  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
});

const entityStats = computed(() => {
  const stats: Record<string, number> = {};
  props.events.forEach((event) => {
    stats[event.entity] = (stats[event.entity] || 0) + 1;
  });
  return stats;
});

const userStats = computed(() => {
  const stats: Record<string, number> = {};
  props.events.forEach((event) => {
    const userName = event.user?.email || 'Unknown';
    stats[userName] = (stats[userName] || 0) + 1;
  });
  return Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
});

const entityChartData = computed(() => ({
  labels: Object.keys(entityStats.value),
  datasets: [
    {
      data: Object.values(entityStats.value),
      backgroundColor: [
        '#3b82f6',
        '#10b981',
        '#f59e0b',
        '#ef4444',
        '#8b5cf6',
        '#ec4899',
        '#06b6d4',
      ],
      borderWidth: 0,
    },
  ],
}));

const activityChartData = computed(() => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toLocaleDateString('default', { weekday: 'short' });
  }).reverse();

  const dailyCounts = last7Days.map((day) => {
    return props.events.filter((event) => {
      const eventDay = new Date(event.createdAt).toLocaleDateString('default', {
        weekday: 'short',
      });
      return eventDay === day;
    }).length;
  });

  return {
    labels: last7Days,
    datasets: [
      {
        label: 'Events',
        data: dailyCounts,
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
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <!-- Total Events -->
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
          {{ events.length }}
        </p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
      </div>
    </div>

    <!-- Most Active User -->
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
          {{ userStats[0]?.[0]?.split('@')[0] || 'N/A' }}
        </p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Most Active User</p>
      </div>
    </div>

    <!-- Most Common Action -->
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
          {{ actionStats[0]?.[0] || 'N/A' }}
        </p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Top Action</p>
      </div>
    </div>

    <!-- Today's Events -->
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
            events.filter(
              (e) =>
                new Date(e.createdAt).toDateString() ===
                new Date().toDateString(),
            ).length
          }}
        </p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Today's Events</p>
      </div>
    </div>
  </div>

  <!-- Charts -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
    <div
      class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-6"
    >
      <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Events by Entity
      </h3>
      <div class="h-64">
        <Doughnut :data="entityChartData" :options="doughnutOptions" />
      </div>
    </div>

    <div
      class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-6"
    >
      <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Activity Trend (7 days)
      </h3>
      <div class="h-64">
        <Bar :data="activityChartData" :options="chartOptions" />
      </div>
    </div>
  </div>

  <!-- Top Actions Table -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div
      class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-6"
    >
      <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Top Actions
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
        Most Active Users
      </h3>
      <div class="space-y-2">
        <div
          v-for="[user, count] in userStats"
          :key="user"
          class="flex items-center justify-between"
        >
          <span class="text-sm text-gray-700 dark:text-gray-300 truncate">{{
            user
          }}</span>
          <span class="text-sm font-medium text-gray-900 dark:text-white">{{
            count
          }}</span>
        </div>
      </div>
    </div>
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
