<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import {
  CpuChipIcon,
  CircleStackIcon,
  CloudIcon,
  ClockIcon,
} from '@heroicons/vue/24/outline';

interface ServerMetrics {
  status: string;
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
  temperature: number;
  lastReboot: string;
  nextMaintenance: string;
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
      class="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-blue-800">
            {{ t('servers.cpu_usage') }}
          </p>
          <p class="text-2xl font-bold text-blue-900">
            {{ metrics.cpuUsage }}%
          </p>
        </div>
        <CpuChipIcon class="h-8 w-8 text-blue-600" />
      </div>
      <div class="mt-2 bg-blue-200 rounded-full h-2">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${metrics.cpuUsage}%` }"
        ></div>
      </div>
    </div>

    <div
      class="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-emerald-800">
            {{ t('servers.memory_usage') }}
          </p>
          <p class="text-2xl font-bold text-emerald-900">
            {{ metrics.memoryUsage }}%
          </p>
        </div>
        <CircleStackIcon class="h-8 w-8 text-emerald-600" />
      </div>
      <div class="mt-2 bg-emerald-200 rounded-full h-2">
        <div
          class="bg-emerald-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${metrics.memoryUsage}%` }"
        ></div>
      </div>
    </div>

    <div
      class="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-amber-800">
            {{ t('servers.disk_usage') }}
          </p>
          <p class="text-2xl font-bold text-amber-900">
            {{ metrics.diskUsage }}%
          </p>
        </div>
        <CloudIcon class="h-8 w-8 text-amber-600" />
      </div>
      <div class="mt-2 bg-amber-200 rounded-full h-2">
        <div
          class="bg-amber-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${metrics.diskUsage}%` }"
        ></div>
      </div>
    </div>

    <div
      class="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-purple-800">
            {{ t('servers.uptime') }}
          </p>
          <p class="text-lg font-bold text-purple-900">
            {{ metrics.uptime }}
          </p>
        </div>
        <ClockIcon class="h-8 w-8 text-purple-600" />
      </div>
    </div>
  </div>
</template>
