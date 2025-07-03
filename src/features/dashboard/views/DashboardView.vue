<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { dashboardApi } from '../api';
import { useI18n } from 'vue-i18n';
import type {
  FullDashboardStatsDto,
  ServerCreationStat,
  UPSLoadStat,
} from '../types';
import DashboardCharts from '../components/DashboardCharts.vue';

const stats = ref<FullDashboardStatsDto | null>(null);
const serverData = ref<ServerCreationStat[]>([]);
const upsData = ref<UPSLoadStat[]>([]);
const { t } = useI18n();

/**
 * Load dashboard statistics and chart data from the API and update the
 * component state.
 */
async function loadDashboard() {
  try {
    stats.value = await dashboardApi.getFullStats();
    serverData.value = await dashboardApi.getServerCreations();
    upsData.value = await dashboardApi.getUPSLoad();
  } catch (error) {
    console.error('Erreur lors du chargement des stats:', error);
  }
}

/**
 * Initialize dashboard data on component mount and refresh it every
 * 30 seconds.
 */
onMounted(() => {
  loadDashboard();
  setInterval(loadDashboard, 30000);
});
</script>

<template>
  <div class="p-6 grid gap-6">
    <h1 class="text-3xl font-bold dark:text-white">
      {{ t('dashboard.welcome_title') }}
    </h1>
    <p class="text-gray-600 dark:text-gray-400 mb-4">
      {{ t('dashboard.overview') }}
    </p>

    <div class="grid grid-cols-3 gap-4">
      <div class="bg-white dark:bg-neutral-800 rounded-xl shadow p-4">
        <h2 class="font-semibold text-lg mb-2 dark:text-white">
          {{ t('dashboard.quick_access') }}
        </h2>
        <ul class="text-blue-600 dark:text-blue-400 space-y-1">
          <li>
            <a href="/servers">{{ t('dashboard.view_servers') }}</a>
          </li>
          <li>
            <a href="/ups">{{ t('dashboard.view_ups') }}</a>
          </li>
          <li>
            <a href="/alerts">{{ t('dashboard.view_alerts') }}</a>
          </li>
        </ul>
      </div>

      <div
        class="bg-white dark:bg-neutral-800 rounded-xl shadow p-4 col-span-2"
      >
        <h2 class="font-semibold text-lg mb-4 dark:text-white">
          {{ t('dashboard.global_stats') }}
        </h2>
        <div v-if="stats" class="grid grid-cols-4 gap-4">
          <div class="stat-card">
            <p>{{ t('dashboard.users') }}</p>
            <span>{{ stats.totalUsers }}</span>
          </div>
          <div class="stat-card">
            <p>{{ t('dashboard.admins') }}</p>
            <span>{{ stats.adminUsers }}</span>
          </div>
          <div class="stat-card">
            <p>{{ t('dashboard.rooms') }}</p>
            <span>{{ stats.totalRooms }}</span>
          </div>
          <div class="stat-card">
            <p>{{ t('dashboard.ups') }}</p>
            <span>{{ stats.totalUps }}</span>
          </div>
          <div class="stat-card">
            <p>{{ t('dashboard.servers') }}</p>
            <span>{{ stats.totalServers }}</span>
          </div>
          <div class="stat-card">
            <p>{{ t('dashboard.vms') }}</p>
            <span>{{ stats.totalVms }}</span>
          </div>
          <div class="stat-card">
            <p>{{ t('dashboard.online_users') }}</p>
            <span>{{ stats.onlineUsers }}</span>
          </div>
          <div class="stat-card">
            <p>{{ t('dashboard.setup_progress') }}</p>
            <div
              class="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5"
            >
              <div
                class="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                :style="{ width: stats.setupProgress + '%' }"
              ></div>
            </div>
            <small>{{ stats.setupProgress }}%</small>
          </div>
        </div>
        <div
          v-else
          class="flex justify-center items-center h-24 text-gray-400 dark:text-gray-500"
        >
          {{ t('dashboard.loading_stats') }}
        </div>
      </div>
    </div>

    <div v-if="stats">
      <DashboardCharts
        :stats="stats"
        :server-data="serverData"
        :ups-data="upsData"
      />
      <div
        v-if="!stats.serversUp && !stats.serversDown"
        class="text-red-500 dark:text-red-400 font-bold"
      >
        {{ t('dashboard.no_servers_error') }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  @apply bg-neutral-50 dark:bg-neutral-700 rounded-lg shadow p-4 flex flex-col items-center justify-center;
}

.stat-card p {
  @apply text-sm text-gray-500 dark:text-gray-400 mb-1;
}

.stat-card span {
  @apply text-xl font-semibold text-blue-600 dark:text-blue-400;
}
</style>
