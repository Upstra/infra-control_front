<script setup lang="ts">
import { computed } from 'vue';
import type { Ups } from '../types';
import { useI18n } from 'vue-i18n';
import {
  BoltIcon,
  MapPinIcon,
  ClockIcon,
  ServerIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline';

defineProps<{
  ups: Ups;
  serverCount?: number;
}>();

const { t } = useI18n();

const upsMetrics = computed(() => ({
  load: Math.floor(Math.random() * 40) + 30, // 30-70%
  batteryLevel: Math.floor(Math.random() * 30) + 70, // 70-100%
  estimatedRuntime: Math.floor(Math.random() * 40) + 20, // 20-60 minutes
  status: Math.random() > 0.1 ? 'online' : 'offline', // 90% online
}));

const getStatusColor = (status: string) => {
  switch (status) {
    case 'online':
      return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
    case 'offline':
      return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    default:
      return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700';
  }
};

const getLoadColor = (load: number) => {
  if (load >= 80)
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
  if (load >= 60)
    return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30';
  return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30';
};

const getBatteryColor = (level: number) => {
  if (level <= 20)
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
  if (level <= 50)
    return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30';
  return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30';
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
            {{ ups.name }}
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-400">{{ ups.ip }}</p>
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
              upsMetrics.status === 'online' ? 'bg-emerald-500' : 'bg-red-500',
            ]"
          ></div>
          <span>{{
            upsMetrics.status === 'online' ? t('ups.online') : t('ups.offline')
          }}</span>
        </span>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="bg-slate-50 dark:bg-neutral-700 rounded-xl p-3">
        <div class="flex items-center justify-between mb-2">
          <span
            class="text-xs font-medium text-slate-600 dark:text-slate-400"
            >{{ t('ups.load') }}</span
          >
          <span
            :class="[
              'text-xs font-bold px-2 py-1 rounded-full',
              getLoadColor(upsMetrics.load),
            ]"
          >
            {{ upsMetrics.load }}%
          </span>
        </div>
        <div class="bg-slate-200 dark:bg-neutral-600 rounded-full h-2">
          <div
            :class="[
              'h-2 rounded-full transition-all duration-300',
              upsMetrics.load >= 80
                ? 'bg-red-500'
                : upsMetrics.load >= 60
                  ? 'bg-amber-500'
                  : 'bg-emerald-500',
            ]"
            :style="{ width: `${upsMetrics.load}%` }"
          ></div>
        </div>
      </div>

      <div class="bg-slate-50 dark:bg-neutral-700 rounded-xl p-3">
        <div class="flex items-center justify-between mb-2">
          <span
            class="text-xs font-medium text-slate-600 dark:text-slate-400"
            >{{ t('ups.battery') }}</span
          >
          <span
            :class="[
              'text-xs font-bold px-2 py-1 rounded-full',
              getBatteryColor(upsMetrics.batteryLevel),
            ]"
          >
            {{ upsMetrics.batteryLevel }}%
          </span>
        </div>
        <div class="bg-slate-200 dark:bg-neutral-600 rounded-full h-2">
          <div
            :class="[
              'h-2 rounded-full transition-all duration-300',
              upsMetrics.batteryLevel <= 20
                ? 'bg-red-500'
                : upsMetrics.batteryLevel <= 50
                  ? 'bg-amber-500'
                  : 'bg-emerald-500',
            ]"
            :style="{ width: `${upsMetrics.batteryLevel}%` }"
          ></div>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between text-sm">
      <div
        class="flex items-center space-x-1 text-slate-600 dark:text-slate-400"
      >
        <ClockIcon class="h-4 w-4" />
        <span
          >{{ t('ups.runtime') }}: {{ upsMetrics.estimatedRuntime }}min</span
        >
      </div>

      <div
        class="flex items-center space-x-1 text-slate-600 dark:text-slate-400"
      >
        <MapPinIcon class="h-4 w-4" />
        <span>{{ ups.roomId }}</span>
      </div>
    </div>

    <div class="border-t border-slate-200 dark:border-neutral-700 pt-4">
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="space-y-1">
          <p class="text-slate-600 dark:text-slate-400">
            <span class="font-medium">{{ t('ups.grace_on') }}:</span>
            <span class="text-slate-900 dark:text-white ml-1"
              >{{ ups.grace_period_on }}s</span
            >
          </p>
          <p class="text-slate-600 dark:text-slate-400">
            <span class="font-medium">{{ t('ups.grace_off') }}:</span>
            <span class="text-slate-900 dark:text-white ml-1"
              >{{ ups.grace_period_off }}s</span
            >
          </p>
        </div>

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
        upsMetrics.status === 'offline' ||
        upsMetrics.load >= 80 ||
        upsMetrics.batteryLevel <= 20
      "
      class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
    >
      <div class="flex items-center space-x-2">
        <ExclamationTriangleIcon
          class="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0"
        />
        <div class="text-sm">
          <p
            v-if="upsMetrics.status === 'offline'"
            class="text-red-800 dark:text-red-400"
          >
            {{ t('ups.warning_offline') }}
          </p>
          <p
            v-else-if="upsMetrics.load >= 80"
            class="text-red-800 dark:text-red-400"
          >
            {{ t('ups.warning_high_load') }}
          </p>
          <p
            v-else-if="upsMetrics.batteryLevel <= 20"
            class="text-red-800 dark:text-red-400"
          >
            {{ t('ups.warning_low_battery') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
