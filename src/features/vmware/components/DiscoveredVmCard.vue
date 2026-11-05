<template>
  <div
    class="bg-surface rounded-lg p-4 border border-border hover:shadow-md transition-shadow"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <h4 class="text-sm font-medium text-text-strong">
          {{ vm.name }}
        </h4>
        <p class="text-xs text-text-muted mt-1">
          {{ vm.serverName }}
        </p>
      </div>
      <div
        :class="[
          'px-2 py-1 text-xs rounded-full',
          vm.powerState === 'poweredOn'
            ? 'bg-success-surface text-success-text'
            : vm.powerState === 'poweredOff'
              ? 'bg-surface-raised text-text-strong'
              : 'bg-warning-surface text-warning-text',
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
        class="flex items-center text-xs text-text"
      >
        <Icon name="globe-alt" class="w-3 h-3 mr-1" />
        {{ vm.ip }}
      </div>
      <div
        v-if="vm.guestOs"
        class="flex items-center text-xs text-text"
      >
        <Icon name="computer-desktop" class="w-3 h-3 mr-1" />
        {{ vm.guestOs }}
      </div>
      <div class="flex items-center text-xs text-text">
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
