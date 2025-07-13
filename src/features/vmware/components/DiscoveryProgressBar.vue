<template>
  <div class="discovery-progress-bar">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center space-x-2">
        <Icon
          :name="statusIcon"
          :class="[
            'w-5 h-5',
            status === 'error' ? 'text-red-500' : 'text-blue-500',
          ]"
        />
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
          {{ statusText }}
        </span>
      </div>
      <span class="text-sm text-gray-500 dark:text-gray-400">
        {{ progressPercentage }}%
      </span>
    </div>

    <div class="relative">
      <div
        class="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700"
      >
        <div
          :style="{ width: `${progressPercentage}%` }"
          :class="[
            'shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500',
            status === 'error' ? 'bg-red-500' : 'bg-blue-500',
          ]"
        />
      </div>
    </div>

    <div v-if="currentServer" class="mt-2">
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ t('vmware.discovery.scanningServer') }}: {{ currentServer }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Icon from '@/shared/components/Icon.vue';

interface Props {
  status: 'idle' | 'starting' | 'discovering' | 'completed' | 'error';
  progressPercentage: number;
  currentServer?: string | null;
}

const props = defineProps<Props>();
const { t } = useI18n();

const statusIcon = computed(() => {
  switch (props.status) {
    case 'starting':
      return 'arrow-path';
    case 'discovering':
      return 'magnifying-glass';
    case 'completed':
      return 'check-circle';
    case 'error':
      return 'exclamation-circle';
    default:
      return 'clock';
  }
});

const statusText = computed(() => {
  switch (props.status) {
    case 'starting':
      return t('vmware.discovery.starting');
    case 'discovering':
      return t('vmware.discovery.discovering');
    case 'completed':
      return t('vmware.discovery.completed');
    case 'error':
      return t('vmware.discovery.error');
    default:
      return t('vmware.discovery.idle');
  }
});
</script>
