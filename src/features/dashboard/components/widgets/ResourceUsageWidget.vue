<template>
  <BaseWidget
    :config="config"
    @remove="emit('close')"
    @settings="emit('settings')"
  >
    <div class="p-4">
      <div v-if="loading" class="flex justify-center items-center h-48">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"
        ></div>
      </div>

      <div
        v-else-if="error"
        class="text-center text-red-500 dark:text-red-400 p-4"
      >
        {{ t('dashboard.widgets.resourceUsage.error') }}
      </div>

      <div v-else class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <Icon
                  name="cpu"
                  class="h-5 w-5 text-gray-600 dark:text-gray-400"
                />
                <h4
                  class="text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  CPU
                </h4>
              </div>
              <Icon
                :name="getTrendIcon(data.cpu.trend)"
                :class="getTrendColor(data.cpu.trend)"
                class="h-4 w-4"
              />
            </div>
            <div class="relative pt-1">
              <div class="flex mb-2 items-center justify-between">
                <div>
                  <span
                    class="text-2xl font-semibold text-gray-900 dark:text-gray-100"
                  >
                    {{ data.cpu.usage.toFixed(1) }}%
                  </span>
                </div>
              </div>
              <div
                class="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700"
              >
                <div
                  :style="{ width: `${data.cpu.usage}%` }"
                  :class="getUsageColor(data.cpu.usage)"
                  class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-300"
                ></div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <Icon
                  name="memory"
                  class="h-5 w-5 text-gray-600 dark:text-gray-400"
                />
                <h4
                  class="text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  {{ t('dashboard.widgets.resourceUsage.memory') }}
                </h4>
              </div>
              <Icon
                :name="getTrendIcon(data.memory.trend)"
                :class="getTrendColor(data.memory.trend)"
                class="h-4 w-4"
              />
            </div>
            <div class="relative pt-1">
              <div class="flex mb-2 items-center justify-between">
                <div>
                  <span
                    class="text-2xl font-semibold text-gray-900 dark:text-gray-100"
                  >
                    {{ data.memory.usage.toFixed(1) }}%
                  </span>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-500">
                  {{ data.memory.used }} / {{ data.memory.total }}
                </div>
              </div>
              <div
                class="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700"
              >
                <div
                  :style="{ width: `${data.memory.usage}%` }"
                  :class="getUsageColor(data.memory.usage)"
                  class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-300"
                ></div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <Icon
                  name="hard-drive"
                  class="h-5 w-5 text-gray-600 dark:text-gray-400"
                />
                <h4
                  class="text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  {{ t('dashboard.widgets.resourceUsage.storage') }}
                </h4>
              </div>
              <Icon
                :name="getTrendIcon(data.storage.trend)"
                :class="getTrendColor(data.storage.trend)"
                class="h-4 w-4"
              />
            </div>
            <div class="relative pt-1">
              <div class="flex mb-2 items-center justify-between">
                <div>
                  <span
                    class="text-2xl font-semibold text-gray-900 dark:text-gray-100"
                  >
                    {{ data.storage.usage.toFixed(1) }}%
                  </span>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-500">
                  {{ data.storage.used }} / {{ data.storage.total }}
                </div>
              </div>
              <div
                class="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700"
              >
                <div
                  :style="{ width: `${data.storage.usage}%` }"
                  :class="getUsageColor(data.storage.usage, 90)"
                  class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-300"
                ></div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <Icon
                  name="network"
                  class="h-5 w-5 text-gray-600 dark:text-gray-400"
                />
                <h4
                  class="text-sm font-medium text-gray-900 dark:text-gray-100"
                >
                  {{ t('dashboard.widgets.resourceUsage.network') }}
                </h4>
              </div>
              <Icon
                :name="getTrendIcon(data.network.trend)"
                :class="getTrendColor(data.network.trend)"
                class="h-4 w-4"
              />
            </div>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-600 dark:text-gray-400">{{
                  t('dashboard.widgets.resourceUsage.inbound')
                }}</span>
                <span
                  class="text-sm font-medium text-gray-900 dark:text-gray-100"
                  >{{ data.network.inbound }}</span
                >
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-600 dark:text-gray-400">{{
                  t('dashboard.widgets.resourceUsage.outbound')
                }}</span>
                <span
                  class="text-sm font-medium text-gray-900 dark:text-gray-100"
                  >{{ data.network.outbound }}</span
                >
              </div>
            </div>
          </div>
        </div>

        <div v-if="showChart && data.cpu.history" class="mt-4">
          <canvas ref="chartCanvas" height="100"></canvas>
        </div>
      </div>
    </div>
  </BaseWidget>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Chart, registerables } from 'chart.js';
import BaseWidget from './BaseWidget.vue';
import Icon from '@/shared/components/Icon.vue';
import { useDashboardStore } from '../../store';
import type { Widget, ResourceUsageResponse } from '../../types';

Chart.register(...registerables);

interface Props {
  config: Widget;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  settings: [];
}>();

const { t } = useI18n();
const dashboardStore = useDashboardStore();

const data = ref<ResourceUsageResponse>({
  cpu: { usage: 0, trend: 'stable' },
  memory: { usage: 0, trend: 'stable' },
  storage: { usage: 0, trend: 'stable' },
  network: { inbound: '0 Mbps', outbound: '0 Mbps', trend: 'stable' },
});
const loading = ref(true);
const error = ref(false);
const chartCanvas = ref<HTMLCanvasElement>();
const showChart = computed(() => props.config.settings?.showChart !== false);

let refreshInterval: number | null = null;
let chart: Chart | null = null;

const fetchResourceUsage = async () => {
  try {
    error.value = false;
    const response = await dashboardStore.getResourceUsage();
    data.value = response;

    if (showChart.value && chart && response.cpu.history) {
      updateChart(response.cpu.history);
    }
  } catch (err) {
    console.error('Error fetching resource usage:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const getUsageColor = (usage: number, threshold = 80) => {
  if (usage >= threshold) return 'bg-red-500';
  if (usage >= 60) return 'bg-yellow-500';
  return 'bg-green-500';
};

const getTrendIcon = (trend: string) => {
  const icons = {
    up: 'trending-up',
    down: 'trending-down',
    stable: 'minus',
  };
  return icons[trend as keyof typeof icons] || 'minus';
};

const getTrendColor = (trend: string) => {
  const colors = {
    up: 'text-red-500',
    down: 'text-green-500',
    stable: 'text-gray-500',
  };
  return colors[trend as keyof typeof colors] || 'text-gray-500';
};

const initChart = () => {
  if (!chartCanvas.value || !showChart.value) return;

  const ctx = chartCanvas.value.getContext('2d');
  if (!ctx) return;

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'CPU Usage',
          data: [],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          display: false,
        },
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 25,
            callback: (value) => `${value}%`,
          },
        },
      },
    },
  });
};

const updateChart = (history: Array<{ timestamp: string; value: number }>) => {
  if (!chart) return;

  const labels = history.map((h) => new Date(h.timestamp).toLocaleTimeString());
  const data = history.map((h) => h.value);

  chart.data.labels = labels;
  chart.data.datasets[0].data = data;
  chart.update();
};

onMounted(() => {
  fetchResourceUsage();

  if (showChart.value) {
    setTimeout(() => initChart(), 100);
  }

  if (props.config.refreshInterval) {
    refreshInterval = window.setInterval(() => {
      fetchResourceUsage();
    }, props.config.refreshInterval);
  }
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
  if (chart) {
    chart.destroy();
  }
});
</script>
