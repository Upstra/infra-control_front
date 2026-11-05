<template>
  <div class="discovery-progress-bar">
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center space-x-2">
        <Icon
          :name="statusIcon"
          :class="`w-5 h-5 ${status === 'error' ? 'text-danger-text' : status === 'cancelled' ? 'text-text-muted' : 'text-primary-text'}`"
        />
        <span class="text-sm font-medium text-text">
          {{ statusText }}
        </span>
      </div>
      <span class="text-sm text-text-muted">
        {{ progressPercentage }}%
      </span>
    </div>

    <div class="relative">
      <div
        class="overflow-hidden h-2 text-xs flex rounded bg-surface-raised"
      >
        <div
          :style="{ width: `${progressPercentage}%` }"
          :class="[
            'shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500',
            status === 'error'
              ? 'bg-danger-solid'
              : status === 'cancelled'
                ? 'bg-surface'
                : 'bg-primary',
          ]"
        />
      </div>
    </div>

    <div v-if="currentServer" class="mt-2">
      <p class="text-sm text-text">
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
  status:
    | 'idle'
    | 'starting'
    | 'discovering'
    | 'completed'
    | 'error'
    | 'cancelled';
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
    case 'cancelled':
      return 'x-circle';
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
    case 'cancelled':
      return t('vmware.discovery.cancelled');
    default:
      return t('vmware.discovery.idle');
  }
});
</script>
