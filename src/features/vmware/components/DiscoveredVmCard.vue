<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <h4 class="text-sm font-medium text-gray-900 dark:text-white">
          {{ vm.name }}
        </h4>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {{ vm.serverName }}
        </p>
      </div>
      <div
        :class="[
          'px-2 py-1 text-xs rounded-full',
          vm.powerState === 'poweredOn'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : vm.powerState === 'poweredOff'
              ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        ]"
      >
        {{
          vm.powerState === 'poweredOn'
            ? t('common.online')
            : vm.powerState === 'poweredOff'
              ? t('common.offline')
              : t('common.unknown')
        }}
      </div>
    </div>

    <div class="mt-3 space-y-1">
      <div
        v-if="vm.ip"
        class="flex items-center text-xs text-gray-600 dark:text-gray-400"
      >
        <Icon name="globe-alt" class="w-3 h-3 mr-1" />
        {{ vm.ip }}
      </div>
      <div
        v-if="vm.guestOs"
        class="flex items-center text-xs text-gray-600 dark:text-gray-400"
      >
        <Icon name="computer-desktop" class="w-3 h-3 mr-1" />
        {{ vm.guestOs }}
      </div>
      <div class="flex items-center text-xs text-gray-600 dark:text-gray-400">
        <Icon name="cpu-chip" class="w-3 h-3 mr-1" />
        {{ vm.numCpu }} vCPU · {{ formatMemory(vm.memoryMB) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Icon from '@/shared/components/Icon.vue';
import type { DiscoveredVmDto } from '../types';

interface Props {
  vm: DiscoveredVmDto;
}

defineProps<Props>();
const { t } = useI18n();

const formatMemory = (memoryMB?: number) => {
  if (!memoryMB) return '';
  if (memoryMB >= 1024) {
    return `${(memoryMB / 1024).toFixed(1)} GB`;
  }
  return `${memoryMB} MB`;
};
</script>
