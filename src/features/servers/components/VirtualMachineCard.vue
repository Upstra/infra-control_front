<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  PlayIcon,
  StopIcon,
  ArrowPathIcon,
  CubeIcon,
  CpuChipIcon,
  CircleStackIcon,
  ServerIcon,
  GlobeAltIcon,
} from '@heroicons/vue/24/outline';

import type { Vm } from '@/features/vms/types';
import { usePowerState } from '@/services/powerStateManager';

interface Props {
  vm: Vm;
}

interface Emits {
  (e: 'vm-action', vmId: string, action: 'start' | 'stop' | 'restart'): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

const { t } = useI18n();
const { isInOperation, operationType } = usePowerState(props.vm.id, 'vm');

const statusColorMap: Record<string, string> = {
  poweredOn:
    'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700',
  running:
    'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700',
  poweredOff:
    'text-red-600 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700',
  stopped:
    'text-red-600 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700',
  suspended:
    'text-amber-600 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700',
  default:
    'text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700',
};

const getStatusColor = (state: string) => {
  return statusColorMap[state] || statusColorMap.default;
};

const actualPowerState = computed(() => {
  return props.vm.metrics?.powerState || props.vm.state;
});

const displayPowerState = computed(() => {
  if (isInOperation.value) {
    return operationType.value === 'starting' ? 'poweredOn' : 'poweredOff';
  }
  return actualPowerState.value;
});

const getStatusDisplay = (state: string) => {
  if (isInOperation.value) {
    return operationType.value === 'starting'
      ? t('servers.starting')
      : t('servers.stopping');
  }

  const statusMap: Record<string, string> = {
    poweredOn: t('servers.vm_status_on'),
    poweredOff: t('servers.vm_status_off'),
    suspended: t('servers.vm_status_suspended'),
    running: t('servers.vm_status_on'),
    stopped: t('servers.vm_status_off'),
  };
  return statusMap[state] || state;
};

const statusClass = computed(() => {
  if (isInOperation.value) {
    return 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700';
  }
  return getStatusColor(displayPowerState.value);
});

const getMetricColor = (value: number) => {
  if (value >= 80) return 'text-red-600';
  if (value >= 60) return 'text-amber-600';
  return 'text-emerald-600';
};

const getGuestToolsColor = (status: string) => {
  const colors: Record<string, string> = {
    green: 'bg-emerald-500',
    yellow: 'bg-amber-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500',
  };
  return colors[status] || colors.gray;
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
          <div class="flex items-center space-x-2">
            <h4 class="text-lg font-semibold text-slate-900 dark:text-white">
              {{ vm.name }}
            </h4>
            <div
              v-if="vm.metrics?.guestToolsStatus"
              :class="[
                'w-2 h-2 rounded-full',
                getGuestToolsColor(vm.metrics.guestToolsStatus),
              ]"
              :title="`VMware Tools: ${vm.metrics.guestToolsStatus}`"
            />
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-400">
            {{ vm.guestOs || vm.os || 'Unknown OS' }}
          </p>
        </div>
      </div>

      <div class="flex items-center space-x-3">
        <span
          :class="[
            'px-3 py-1 text-xs font-semibold rounded-full border flex items-center gap-1',
            statusClass,
          ]"
        >
          <svg
            v-if="isInOperation"
            class="animate-spin h-3 w-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ getStatusDisplay(actualPowerState) }}
        </span>

        <div class="flex space-x-1">
          <button
            v-if="
              !isInOperation &&
              (displayPowerState === 'poweredOff' ||
                displayPowerState === 'stopped')
            "
            @click="$emit('vm-action', vm.id, 'start')"
            class="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
            :title="t('servers.vm_start')"
          >
            <PlayIcon class="h-4 w-4" />
          </button>
          <button
            v-if="
              !isInOperation &&
              (displayPowerState === 'poweredOn' ||
                displayPowerState === 'running')
            "
            @click="$emit('vm-action', vm.id, 'stop')"
            class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            :title="t('servers.vm_stop')"
          >
            <StopIcon class="h-4 w-4" />
          </button>
          <button
            v-if="
              !isInOperation &&
              (displayPowerState === 'poweredOn' ||
                displayPowerState === 'running')
            "
            @click="$emit('vm-action', vm.id, 'restart')"
            class="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            :title="t('servers.vm_restart')"
          >
            <ArrowPathIcon class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
      <div
        class="flex items-center space-x-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3"
      >
        <CpuChipIcon
          class="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0"
        />
        <div class="min-w-0">
          <p class="text-xs font-medium text-slate-600 dark:text-slate-400">
            {{ t('servers.vcpus') }}
          </p>
          <p class="text-sm font-bold text-slate-900 dark:text-white">
            {{ vm.numCPU || 0 }}
          </p>
        </div>
      </div>
      <div
        class="flex items-center space-x-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3"
      >
        <CircleStackIcon
          class="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0"
        />
        <div class="min-w-0">
          <p class="text-xs font-medium text-slate-600 dark:text-slate-400">
            {{ t('servers.memory') }}
          </p>
          <p class="text-sm font-bold text-slate-900 dark:text-white">
            {{ vm.metrics?.memoryMB || 0 }} MB
          </p>
        </div>
      </div>
      <div
        class="flex items-center space-x-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3"
      >
        <ServerIcon
          class="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0"
        />
        <div class="min-w-0">
          <p class="text-xs font-medium text-slate-600 dark:text-slate-400">
            CPU
          </p>
          <p
            :class="[
              'text-sm font-bold',
              getMetricColor(vm.metrics?.cpuUsage || 0),
            ]"
          >
            {{ vm.metrics?.cpuUsage?.toFixed(0) || '0' }}%
          </p>
        </div>
      </div>
      <div
        class="flex items-center space-x-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3"
      >
        <GlobeAltIcon
          class="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0"
        />
        <div class="min-w-0">
          <p class="text-xs font-medium text-slate-600 dark:text-slate-400">
            IP
          </p>
          <p class="text-sm font-bold text-slate-900 dark:text-white truncate">
            {{ vm.ip || 'N/A' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
