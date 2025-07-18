<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import {
  CpuChipIcon,
  CircleStackIcon,
  ClockIcon,
} from '@heroicons/vue/24/outline';

interface ServerMetrics {
  status: string;
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  memoryMB?: number;
  totalMemoryMB?: number;
}

interface Props {
  metrics: ServerMetrics;
}

defineProps<Props>();

const { t } = useI18n();
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <div
      class="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-blue-800 dark:text-blue-300">
            {{ t('servers.cpu_usage') }}
          </p>
          <p class="text-2xl font-bold text-blue-900 dark:text-blue-200">
            {{ metrics.cpuUsage.toFixed(2) }}%
          </p>
        </div>
        <CpuChipIcon class="h-8 w-8 text-blue-600 dark:text-blue-400" />
      </div>
      <div class="mt-2 bg-blue-200 dark:bg-blue-800/50 rounded-full h-2">
        <div
          class="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${metrics.cpuUsage}%` }"
        ></div>
      </div>
    </div>

    <div
      class="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-emerald-800 dark:text-emerald-300">
            {{ t('servers.memory_usage') }}
          </p>
          <p class="text-2xl font-bold text-emerald-900 dark:text-emerald-200">
            {{ metrics.memoryUsage.toFixed(1) }}%
          </p>
        </div>
        <CircleStackIcon
          class="h-8 w-8 text-emerald-600 dark:text-emerald-400"
        />
      </div>
      <div class="mt-2 bg-emerald-200 dark:bg-emerald-800/50 rounded-full h-2">
        <div
          class="bg-emerald-600 dark:bg-emerald-400 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${metrics.memoryUsage}%` }"
        ></div>
      </div>
    </div>

    <div
      v-if="metrics.memoryMB && metrics.totalMemoryMB"
      class="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-4 border border-amber-200 dark:border-amber-700"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-amber-800 dark:text-amber-300">
            {{ t('servers.memory_details') }}
          </p>
          <p class="text-2xl font-bold text-amber-900 dark:text-amber-200">
            {{ (metrics.memoryMB / 1024).toFixed(1) }}GB
          </p>
          <p class="text-xs text-amber-700 dark:text-amber-400">
            / {{ (metrics.totalMemoryMB / 1024).toFixed(1) }}GB
          </p>
        </div>
        <CircleStackIcon class="h-8 w-8 text-amber-600 dark:text-amber-400" />
      </div>
    </div>

    <div
      class="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-purple-800 dark:text-purple-300">
            {{ t('servers.uptime') }}
          </p>
          <p class="text-lg font-bold text-purple-900 dark:text-purple-200">
            {{ metrics.uptime }}
          </p>
        </div>
        <ClockIcon class="h-8 w-8 text-purple-600 dark:text-purple-400" />
      </div>
    </div>
  </div>
</template>
