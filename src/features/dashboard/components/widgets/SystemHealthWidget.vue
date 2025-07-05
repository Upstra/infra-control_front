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
        {{ t('dashboard.widgets.systemHealth.error') }}
      </div>

      <div v-else>
        <div class="text-center mb-6">
          <div class="relative inline-block">
            <svg class="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                stroke-width="12"
                fill="none"
                class="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                stroke-width="12"
                fill="none"
                :stroke-dasharray="`${(data.score / 100) * 351.86} 351.86`"
                :class="getScoreColor(data.score)"
                class="transition-all duration-1000"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <div>
                <div
                  class="text-3xl font-bold"
                  :class="getScoreTextColor(data.score)"
                >
                  {{ data.score }}%
                </div>
                <div class="text-xs text-gray-600 dark:text-gray-400">
                  {{ t('dashboard.widgets.systemHealth.score') }}
                </div>
              </div>
            </div>
          </div>
          <div class="mt-2">
            <span
              :class="[
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                getStatusBadgeClass(data.status),
              ]"
            >
              <Icon :name="getStatusIcon(data.status)" class="mr-1 h-4 w-4" />
              {{ t(`dashboard.widgets.systemHealth.status.${data.status}`) }}
            </span>
          </div>
        </div>

        <div class="space-y-3">
          <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">
            {{ t('dashboard.widgets.systemHealth.components') }}
          </h4>

          <div class="space-y-2">
            <div
              v-for="component in data.components"
              :key="component.name"
              class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                  <div
                    :class="[
                      'w-2 h-2 rounded-full',
                      getComponentStatusColor(component.status),
                    ]"
                  ></div>
                  <span
                    class="text-sm font-medium text-gray-900 dark:text-gray-100"
                    >{{ component.name }}</span
                  >
                </div>
                <span
                  :class="[
                    'text-xs',
                    component.status === 'operational'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400',
                  ]"
                >
                  {{
                    t(
                      `dashboard.widgets.systemHealth.componentStatus.${component.status}`,
                    )
                  }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-gray-600 dark:text-gray-400">{{
                    t('dashboard.widgets.systemHealth.responseTime')
                  }}</span>
                  <span class="font-medium text-gray-900 dark:text-gray-100"
                    >{{ component.responseTime }}ms</span
                  >
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-600 dark:text-gray-400">{{
                    t('dashboard.widgets.systemHealth.uptime')
                  }}</span>
                  <span class="font-medium text-gray-900 dark:text-gray-100"
                    >{{ component.uptime.toFixed(2) }}%</span
                  >
                </div>
              </div>

              <div
                v-if="component.issues && component.issues.length > 0"
                class="mt-2"
              >
                <p
                  v-for="(issue, index) in component.issues"
                  :key="index"
                  class="text-xs text-red-600 dark:text-red-400"
                >
                  ⚠ {{ issue }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 text-center text-xs text-gray-500 dark:text-gray-500">
          {{ t('dashboard.widgets.systemHealth.lastCheck') }}:
          {{ formatTime(data.lastCheck) }}
        </div>
      </div>
    </div>
  </BaseWidget>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseWidget from './BaseWidget.vue';
import Icon from '@/shared/components/Icon.vue';
import { useDashboardStore } from '../../store';
import type { Widget, SystemHealthResponse } from '../../types';
import { formatDistanceToNow } from 'date-fns';

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

const data = ref<SystemHealthResponse>({
  status: 'healthy',
  score: 0,
  components: [],
  lastCheck: new Date().toISOString(),
});
const loading = ref(true);
const error = ref(false);

let refreshInterval: number | null = null;

const fetchSystemHealth = async () => {
  try {
    error.value = false;
    const response = await dashboardStore.getSystemHealth();
    data.value = response;
  } catch (err) {
    console.error('Error fetching system health:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const formatTime = (timestamp: string) => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-500';
  if (score >= 70) return 'text-yellow-500';
  return 'text-red-500';
};

const getScoreTextColor = (score: number) => {
  if (score >= 90) return 'text-green-600 dark:text-green-400';
  if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

const getStatusIcon = (status: string) => {
  const icons = {
    healthy: 'check-circle',
    degraded: 'alert-triangle',
    critical: 'alert-circle',
  };
  return icons[status as keyof typeof icons] || 'help-circle';
};

const getStatusBadgeClass = (status: string) => {
  const classes = {
    healthy:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    degraded:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return classes[status as keyof typeof classes] || classes.healthy;
};

const getComponentStatusColor = (status: string) => {
  const colors = {
    operational: 'bg-green-500',
    degraded: 'bg-yellow-500',
    down: 'bg-red-500',
  };
  return colors[status as keyof typeof colors] || 'bg-gray-500';
};

onMounted(() => {
  fetchSystemHealth();

  if (props.config.refreshInterval) {
    refreshInterval = window.setInterval(() => {
      fetchSystemHealth();
    }, props.config.refreshInterval);
  }
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>
