<script setup lang="ts">
import { computed } from 'vue';
import type { Ups } from '../types';
import { useI18n } from 'vue-i18n';
import {
  BoltIcon,
  ClockIcon,
  ServerIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline';

const props = defineProps<{
  ups: Ups;
  serverCount?: number;
}>();

const { t } = useI18n();

const upsMetrics = computed(() => {
  const battery = props.ups.batteryStatus;

  if (!battery) {
    return {
      load: 0,
      batteryLevel: 100,
      estimatedRuntime: 0,
      status: 'unknown',
      alertLevel: 'normal' as const,
    };
  }

  return {
    load: battery.load || 0,
    batteryLevel: battery.batteryPercentage || 100,
    estimatedRuntime: battery.minutesRemaining || 0,
    status: battery.minutesRemaining > 0 ? 'online' : 'offline',
    alertLevel: battery.alertLevel,
  };
});

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
    case 'offline':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    case 'unknown':
    default:
      return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700';
  }
};

const getAlertLevelColor = (level: string) => {
  switch (level) {
    case 'critical':
      return 'bg-red-500 animate-pulse';
    case 'warning':
      return 'bg-amber-500';
    case 'low':
      return 'bg-yellow-500';
    case 'normal':
    default:
      return 'bg-emerald-500';
  }
};

const formatTimestamp = (timestamp: Date | string | undefined) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return t('common.just_now');
  if (diffMins < 60) return t('common.minutes_ago', { count: diffMins });

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return t('common.hours_ago', { count: diffHours });

  return date.toLocaleDateString();
};
</script>

<template>
  <div
    class="bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-2xl shadow-sm p-6 space-y-4 hover:shadow-md transition-all duration-200 cursor-pointer"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
          <BoltIcon class="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
            {{ props.ups.name }}
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-400">
            {{ props.ups.ip }}
          </p>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <span
          :class="[
            'px-3 py-1 text-xs font-semibold rounded-full border flex items-center space-x-1',
            getStatusColor(upsMetrics.status),
          ]"
        >
          <div
            :class="[
              'w-2 h-2 rounded-full',
              getAlertLevelColor(upsMetrics.alertLevel),
            ]"
          ></div>
          <span>{{
            upsMetrics.status === 'online' ? t('ups.online') : t('ups.offline')
          }}</span>
        </span>
      </div>
    </div>

    <div class="bg-slate-50 dark:bg-neutral-700 rounded-xl p-4">
      <div class="text-center">
        <div
          class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2"
        >
          {{ t('ups.battery_status') }}
        </div>
        <div
          class="text-2xl font-bold mb-1"
          :class="[
            upsMetrics.alertLevel === 'critical'
              ? 'text-red-600'
              : upsMetrics.alertLevel === 'warning' ||
                  upsMetrics.alertLevel === 'low'
                ? 'text-amber-600'
                : 'text-emerald-600',
          ]"
        >
          {{ upsMetrics.estimatedRuntime }}min
        </div>
        <div class="text-xs text-slate-500 dark:text-slate-400">
          {{ t('ups.stats.average_backup_time') }}
        </div>
      </div>
    </div>

    <div class="flex items-center justify-center text-sm">
      <div
        class="flex items-center space-x-1 text-slate-600 dark:text-slate-400"
      >
        <ClockIcon class="h-4 w-4" />
        <span
          >{{ t('ups.runtime') }}: {{ upsMetrics.estimatedRuntime }}min</span
        >
      </div>
    </div>

    <div class="border-t border-slate-200 dark:border-neutral-700 pt-4">
      <div class="grid grid-cols-1 gap-4 text-sm">
        <div class="flex items-center justify-end">
          <div class="text-center">
            <div class="flex items-center justify-center mb-1">
              <ServerIcon class="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-400">
              {{ serverCount ?? 0 }}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-500">
              {{ t('ups.connected_servers') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="
        upsMetrics.alertLevel !== 'normal' ||
        upsMetrics.status === 'offline' ||
        upsMetrics.load >= 80 ||
        upsMetrics.batteryLevel <= 20
      "
      :class="[
        'border rounded-lg p-3',
        upsMetrics.alertLevel === 'critical' || upsMetrics.status === 'offline'
          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          : upsMetrics.alertLevel === 'warning' || upsMetrics.load >= 80
            ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      ]"
    >
      <div class="flex items-center space-x-2">
        <ExclamationTriangleIcon
          :class="[
            'h-4 w-4 flex-shrink-0',
            upsMetrics.alertLevel === 'critical' ||
            upsMetrics.status === 'offline'
              ? 'text-red-600 dark:text-red-400'
              : upsMetrics.alertLevel === 'warning' || upsMetrics.load >= 80
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-yellow-600 dark:text-yellow-400',
          ]"
        />
        <div class="text-sm">
          <p
            v-if="props.ups.batteryStatus?.statusLabel"
            :class="[
              upsMetrics.alertLevel === 'critical' ||
              upsMetrics.status === 'offline'
                ? 'text-red-800 dark:text-red-400'
                : upsMetrics.alertLevel === 'warning'
                  ? 'text-amber-800 dark:text-amber-400'
                  : 'text-yellow-800 dark:text-yellow-400',
            ]"
          >
            {{ props.ups.batteryStatus.statusLabel }}
          </p>
          <p
            v-else-if="upsMetrics.status === 'offline'"
            class="text-red-800 dark:text-red-400"
          >
            {{ t('ups.warning_offline') }}
          </p>
          <p
            v-else-if="upsMetrics.load >= 80"
            class="text-amber-800 dark:text-amber-400"
          >
            {{ t('ups.warning_high_load') }}
          </p>
          <p
            v-else-if="upsMetrics.batteryLevel <= 20"
            class="text-amber-800 dark:text-amber-400"
          >
            {{ t('ups.warning_low_battery') }}
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="props.ups.batteryStatus?.timestamp"
      class="text-xs text-slate-500 dark:text-slate-500 text-right mt-2"
    >
      {{ t('common.last_update') }}:
      {{ formatTimestamp(props.ups.batteryStatus.timestamp) }}
    </div>
  </div>
</template>
