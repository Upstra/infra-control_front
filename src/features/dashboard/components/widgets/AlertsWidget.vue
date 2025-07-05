<template>
  <BaseWidget
    :config="widget"
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
        {{ t('dashboard.widgets.alerts.error') }}
      </div>

      <div v-else>
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full bg-red-500"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('dashboard.widgets.alerts.critical') }}:
                {{ summary.critical }}
              </span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('dashboard.widgets.alerts.warning') }}:
                {{ summary.warning }}
              </span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 rounded-full bg-blue-500"></div>
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ t('dashboard.widgets.alerts.info') }}: {{ summary.info }}
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="alerts.length === 0"
          class="text-center text-gray-500 dark:text-gray-400 p-8"
        >
          <Icon
            name="check-circle"
            class="h-12 w-12 mx-auto mb-2 text-green-500"
          />
          <p>{{ t('dashboard.widgets.alerts.noAlerts') }}</p>
        </div>

        <div v-else class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="alert in filteredAlerts"
            :key="alert.id"
            :class="[
              'p-3 rounded-lg border cursor-pointer transition-all',
              getAlertStyles(alert.severity),
              alert.acknowledged && 'opacity-60',
            ]"
            @click="toggleAcknowledge(alert)"
          >
            <div class="flex items-start space-x-3">
              <Icon
                :name="getAlertIcon(alert.severity)"
                :class="getAlertIconColor(alert.severity)"
                class="flex-shrink-0 mt-0.5"
              />

              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h4
                    class="text-sm font-medium text-gray-900 dark:text-gray-100"
                  >
                    {{ alert.resource.name }}
                  </h4>
                  <span class="text-xs text-gray-500 dark:text-gray-500">
                    {{ formatTime(alert.timestamp) }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {{ alert.message }}
                </p>
              </div>

              <button
                v-if="!alert.acknowledged"
                @click.stop="acknowledgeAlert(alert)"
                class="flex-shrink-0 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {{ t('dashboard.widgets.alerts.acknowledge') }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="showFilter" class="mt-4 flex items-center space-x-2">
          <label class="text-sm text-gray-600 dark:text-gray-400"
            >{{ t('dashboard.widgets.alerts.filter') }}:</label
          >
          <select
            v-model="filterSeverity"
            class="text-sm rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="all">{{ t('dashboard.widgets.alerts.all') }}</option>
            <option value="critical">
              {{ t('dashboard.widgets.alerts.critical') }}
            </option>
            <option value="warning">
              {{ t('dashboard.widgets.alerts.warning') }}
            </option>
            <option value="info">
              {{ t('dashboard.widgets.alerts.info') }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </BaseWidget>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseWidget from './BaseWidget.vue';
import Icon from '@/shared/components/Icon.vue';
import { useDashboardStore } from '../../store';
import type { Widget, Alert } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  widget: Widget;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  settings: [];
}>();

const { t } = useI18n();
const dashboardStore = useDashboardStore();

const alerts = ref<Alert[]>([]);
const summary = ref({ critical: 0, warning: 0, info: 0 });
const loading = ref(true);
const error = ref(false);
const filterSeverity = ref('all');
const showFilter = computed(() => props.widget.settings?.showFilter !== false);

let refreshInterval: number | null = null;

const filteredAlerts = computed(() => {
  if (filterSeverity.value === 'all') {
    return alerts.value;
  }
  return alerts.value.filter(
    (alert) => alert.severity === filterSeverity.value,
  );
});

const fetchAlerts = async () => {
  try {
    loading.value = true;
    error.value = false;
    const response = await dashboardStore.getAlerts();
    alerts.value = response.alerts;
    summary.value = response.summary;
  } catch (err) {
    console.error('Error fetching alerts:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const formatTime = (timestamp: string) => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};

const getAlertStyles = (severity: string) => {
  const styles = {
    critical:
      'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30',
    warning:
      'border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30',
    info: 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30',
  };
  return styles[severity as keyof typeof styles] || styles.info;
};

const getAlertIcon = (severity: string) => {
  const icons = {
    critical: 'alert-circle',
    warning: 'alert-triangle',
    info: 'info',
  };
  return icons[severity as keyof typeof icons] || 'info';
};

const getAlertIconColor = (severity: string) => {
  const colors = {
    critical: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
  };
  return colors[severity as keyof typeof colors] || colors.info;
};

const acknowledgeAlert = (alert: Alert) => {
  alert.acknowledged = true;
  // TODO: Call API to acknowledge alert
};

const toggleAcknowledge = (alert: Alert) => {
  if (props.widget.settings?.allowAcknowledge !== false) {
    acknowledgeAlert(alert);
  }
};

onMounted(() => {
  fetchAlerts();

  if (props.widget.refreshInterval) {
    refreshInterval = window.setInterval(() => {
      fetchAlerts();
    }, props.widget.refreshInterval);
  }
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});
</script>
