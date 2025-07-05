<script setup lang="ts">
import { computed } from 'vue';
import BaseWidget from './BaseWidget.vue';
import type { WidgetConfig } from '../../types/widget';
import { useWidget } from '../../composables/useWidget';
import { dashboardApi } from '../../api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'vue-chartjs';
import { useI18n } from 'vue-i18n';

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps<{
  config: WidgetConfig;
}>();

const { t } = useI18n();

const { widgetData, refresh } = useWidget(props.config, async () => {
  return await dashboardApi.getStats();
});

const stats = computed(() => widgetData.value.data);

const chartData = computed(() => ({
  labels: [t('dashboard.online'), t('dashboard.offline')],
  datasets: [{
    data: [stats.value?.serversUp || 0, stats.value?.serversDown || 0],
    backgroundColor: ['#10b981', '#ef4444'],
    borderWidth: 0,
  }]
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: '#9ca3af',
        padding: 10,
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 10,
      cornerRadius: 8,
    }
  }
};

const totalServers = computed(() => (stats.value?.serversUp || 0) + (stats.value?.serversDown || 0));
const upPercentage = computed(() => {
  if (totalServers.value === 0) return 0;
  return Math.round((stats.value?.serversUp || 0) / totalServers.value * 100);
});
</script>

<template>
  <BaseWidget
    :config="config"
    :loading="widgetData.loading"
    :error="widgetData.error"
    @refresh="refresh"
  >
    <div class="flex flex-col items-center">
      <div class="w-full h-48 mb-4">
        <Doughnut v-if="stats" :data="chartData" :options="chartOptions" />
      </div>
      
      <div class="text-center space-y-2">
        <div class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ upPercentage }}%
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ t('dashboard.servers_online') }}
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mt-4 w-full">
        <div class="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div class="text-2xl font-bold text-green-600 dark:text-green-400">
            {{ stats?.serversUp || 0 }}
          </div>
          <div class="text-xs text-green-700 dark:text-green-300">
            {{ t('dashboard.online') }}
          </div>
        </div>
        <div class="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div class="text-2xl font-bold text-red-600 dark:text-red-400">
            {{ stats?.serversDown || 0 }}
          </div>
          <div class="text-xs text-red-700 dark:text-red-300">
            {{ t('dashboard.offline') }}
          </div>
        </div>
      </div>
    </div>
  </BaseWidget>
</template>