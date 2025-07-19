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
        {{ t('dashboard.widgets.upsStatus.error') }}
      </div>

      <div v-else>
        <div class="grid grid-cols-4 gap-2 mb-4">
          <div class="text-center">
            <div
              class="text-2xl font-semibold text-gray-900 dark:text-gray-100"
            >
              {{ summary.total }}
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ t('dashboard.widgets.upsStatus.total') }}
            </p>
          </div>
          <div class="text-center">
            <div
              class="text-2xl font-semibold text-green-600 dark:text-green-400"
            >
              {{ summary.online }}
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ t('dashboard.widgets.upsStatus.online') }}
            </p>
          </div>
          <div class="text-center">
            <div
              class="text-2xl font-semibold text-yellow-600 dark:text-yellow-400"
            >
              {{ summary.onBattery }}
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ t('dashboard.widgets.upsStatus.onBattery') }}
            </p>
          </div>
          <div class="text-center">
            <div class="text-2xl font-semibold text-red-600 dark:text-red-400">
              {{ unavailableCount }}
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              {{ t('dashboard.widgets.upsStatus.status.unavailable') }}
            </p>
          </div>
        </div>

        <div class="mb-4" v-if="averageLoadAvailable">
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm text-gray-600 dark:text-gray-400">{{
              t('dashboard.widgets.upsStatus.averageLoad')
            }}</span>
            <span class="text-sm font-medium text-gray-900 dark:text-gray-100"
              >{{ averageLoad }}%</span
            >
          </div>
          <div
            class="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700"
          >
            <div
              :style="{ width: `${averageLoad}%` }"
              :class="getLoadColor(averageLoad)"
              class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-300"
            ></div>
          </div>
        </div>

        <div class="space-y-3 max-h-64 overflow-y-auto">
          <div
            v-for="ups in upsList"
            :key="ups.id"
            :class="[
              'border rounded-lg p-3 transition-colors',
              getUpsCardClass(ups.status),
            ]"
          >
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ ups.name }}
              </h4>
              <span
                :class="[
                  'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
                  getStatusBadgeClass(ups.status),
                ]"
              >
                <div
                  :class="[
                    'w-2 h-2 rounded-full mr-1',
                    getStatusDotColor(ups.status),
                  ]"
                ></div>
                {{ t(`dashboard.widgets.upsStatus.status.${ups.status}`) }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-gray-600 dark:text-gray-400">{{
                    t('dashboard.widgets.upsStatus.battery')
                  }}</span>
                  <span class="font-medium text-gray-900 dark:text-gray-100"
                    >{{ ups.batteryLevel }}%</span
                  >
                </div>
                <div
                  class="overflow-hidden h-1 flex rounded bg-gray-200 dark:bg-gray-700"
                >
                  <div
                    :style="{ width: `${ups.batteryLevel}%` }"
                    :class="getBatteryColor(ups.batteryLevel)"
                    class="shadow-none flex flex-col"
                  ></div>
                </div>
              </div>

              <div v-if="ups.load !== null">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-gray-600 dark:text-gray-400">{{
                    t('dashboard.widgets.upsStatus.load')
                  }}</span>
                  <span class="font-medium text-gray-900 dark:text-gray-100"
                    >{{ ups.load }}%</span
                  >
                </div>
                <div
                  class="overflow-hidden h-1 flex rounded bg-gray-200 dark:bg-gray-700"
                >
                  <div
                    :style="{ width: `${ups.load}%` }"
                    :class="getLoadColor(ups.load)"
                    class="shadow-none flex flex-col"
                  ></div>
                </div>
              </div>
            </div>

            <div class="flex gap-2 mt-2 text-xs">
              <div class="flex items-center gap-1">
                <Icon name="clock" class="h-3 w-3 text-gray-400" />
                <span class="font-medium text-gray-900 dark:text-gray-100"
                  >{{ ups.runtime
                  }}{{ t('dashboard.widgets.upsStatus.minutes') }}</span
                >
              </div>
              <div
                v-if="ups.temperature !== null"
                class="flex items-center gap-1"
              >
                <Icon name="thermometer" class="h-3 w-3 text-gray-400" />
                <span class="font-medium text-gray-900 dark:text-gray-100"
                  >{{ ups.temperature }}°C</span
                >
              </div>
              <div v-if="ups.nextTest" class="flex items-center gap-1">
                <Icon name="calendar" class="h-3 w-3 text-gray-400" />
                <span class="font-medium text-gray-900 dark:text-gray-100">{{
                  formatDate(ups.nextTest)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseWidget>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseWidget from './BaseWidget.vue';
import Icon from '@/shared/components/Icon.vue';
import { useDashboardStore } from '../../store';
import type { Widget, UpsDevice } from '../../types';
import { format } from 'date-fns';

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

const upsList = ref<UpsDevice[]>([]);
const summary = ref({
  total: 0,
  online: 0,
  onBattery: 0,
  offline: 0,
  averageLoad: 0,
});

const unavailableCount = computed(() => {
  return upsList.value.filter(
    (ups) => ups.status === 'unavailable' || ups.status === 'offline',
  ).length;
});

const averageLoad = computed(() => {
  const loadsWithData = upsList.value
    .filter((ups) => ups.load !== null)
    .map((ups) => ups.load as number);
  if (loadsWithData.length === 0) return 0;
  return Math.round(
    loadsWithData.reduce((sum, load) => sum + load, 0) / loadsWithData.length,
  );
});

const averageLoadAvailable = computed(() => {
  return upsList.value.some((ups) => ups.load !== null);
});
const loading = ref(true);
const error = ref(false);

let refreshInterval: number | null = null;

const fetchUpsStatus = async () => {
  try {
    error.value = false;
    const response = await dashboardStore.getUpsStatus();
    upsList.value = response.ups;
    summary.value = response.summary;
  } catch (err) {
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const formatDate = (date: string | null) => {
  if (!date) return '';
  return format(new Date(date), 'dd/MM');
};

const getUpsCardClass = (status: string) => {
  const classes = {
    online: 'border-gray-200 dark:border-gray-700',
    onBattery:
      'border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20',
    offline: 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
    unavailable:
      'border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/20',
  };
  return classes[status as keyof typeof classes] || classes.online;
};

const getStatusBadgeClass = (status: string) => {
  const classes = {
    online: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    onBattery:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    offline: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    unavailable:
      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };
  return classes[status as keyof typeof classes] || classes.online;
};

const getStatusDotColor = (status: string) => {
  const colors = {
    online: 'bg-green-500',
    onBattery: 'bg-yellow-500',
    offline: 'bg-red-500',
    unavailable: 'bg-gray-500',
  };
  return colors[status as keyof typeof colors] || 'bg-gray-500';
};

const getBatteryColor = (level: number) => {
  if (level <= 20) return 'bg-red-500';
  if (level <= 50) return 'bg-yellow-500';
  return 'bg-green-500';
};

const getLoadColor = (load: number | null) => {
  if (load === null) return 'bg-gray-400';
  if (load >= 80) return 'bg-red-500';
  if (load >= 60) return 'bg-yellow-500';
  return 'bg-green-500';
};

onMounted(() => {
  fetchUpsStatus();

  if (props.config.refreshInterval) {
    refreshInterval = window.setInterval(() => {
      fetchUpsStatus();
    }, props.config.refreshInterval);
  }
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>
