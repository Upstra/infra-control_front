<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import {
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  CubeIcon,
} from '@heroicons/vue/24/outline';

import type { Vm } from '@/features/vms/types';

interface Props {
  vm: Vm;
}

interface Emits {
  (e: 'vm-action', vmId: string, action: 'start' | 'stop' | 'restart'): void;
}

defineProps<Props>();
defineEmits<Emits>();

const { t } = useI18n();

const statusColorMap: Record<string, string> = {
  running:
    'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700',
  stopped:
    'text-red-600 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700',
  default:
    'text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700',
};

const getStatusColor = (state: string) => {
  return statusColorMap[state] || statusColorMap.default;
};

const getMetricColor = (value: number) => {
  if (value >= 80) return 'text-red-600 bg-red-100 dark:bg-red-900/30';
  if (value >= 60) return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30';
  return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30';
};
</script>

<template>
  <div
    class="bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl p-6 hover:shadow-md transition-shadow"
  >
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-3">
        <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <CubeIcon class="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h4 class="text-lg font-semibold text-slate-900 dark:text-white">
            {{ vm.name }}
          </h4>
          <p class="text-sm text-slate-600 dark:text-slate-400">
            {{ vm.guestOs || vm.os || 'Unknown OS' }} • {{ vm.ip || 'No IP' }}
          </p>
        </div>
      </div>

      <div class="flex items-center space-x-3">
        <span
          :class="[
            'px-3 py-1 text-xs font-semibold rounded-full border',
            getStatusColor(vm.metrics?.powerState || vm.state),
          ]"
        >
          {{ vm.metrics?.powerState || vm.state }}
        </span>

        <div class="flex space-x-1">
          <button
            v-if="vm.state === 'stopped'"
            @click="$emit('vm-action', vm.id, 'start')"
            class="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
            :title="t('servers.vm_start')"
          >
            <PlayIcon class="h-4 w-4" />
          </button>
          <button
            v-if="vm.state === 'running'"
            @click="$emit('vm-action', vm.id, 'stop')"
            class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            :title="t('servers.vm_stop')"
          >
            <StopIcon class="h-4 w-4" />
          </button>
          <button
            v-if="vm.state === 'running'"
            @click="$emit('vm-action', vm.id, 'restart')"
            class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            :title="t('servers.vm_restart')"
          >
            <ArrowPathIcon class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div class="text-center">
        <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
          CPU
        </p>
        <p
          :class="[
            'text-lg font-bold',
            getMetricColor(vm.metrics?.cpuUsage || 0),
          ]"
        >
          {{ vm.metrics?.cpuUsage?.toFixed(1) || '0' }}%
        </p>
      </div>
      <div class="text-center">
        <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
          {{ t('servers.memory') }}
        </p>
        <p
          :class="[
            'text-lg font-bold',
            getMetricColor(vm.metrics?.memoryUsage || 0),
          ]"
        >
          {{ vm.metrics?.memoryUsage?.toFixed(1) || '0' }}%
        </p>
      </div>
      <div class="text-center">
        <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
          {{ t('servers.storage') }}
        </p>
        <p class="text-lg font-bold text-slate-900 dark:text-white">
          {{ vm.metrics?.storageGB?.toFixed(1) || '0' }}GB
        </p>
      </div>
      <div class="text-center">
        <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
          {{ t('servers.ip_address') }}
        </p>
        <p class="text-lg font-bold text-slate-900 dark:text-white">
          {{ vm.ip }}
        </p>
      </div>
    </div>
  </div>
</template>
