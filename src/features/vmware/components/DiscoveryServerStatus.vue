<template>
  <div
    :class="[
      'flex items-center justify-between p-3 rounded-lg',
      result.success
        ? 'bg-success-surface'
        : 'bg-danger-surface',
    ]"
  >
    <div class="flex items-center space-x-3">
      <Icon
        :name="result.success ? 'check-circle' : 'x-circle'"
        :class="`w-5 h-5 ${result.success ? 'text-success-text' : 'text-danger-text'}`"
      />
      <div>
        <h4 class="text-sm font-medium text-text-strong">
          {{ result.serverName }}
        </h4>
        <p class="text-xs text-text">
          <template v-if="result.success">
            {{ t('vmware.discovery.vmsFound', { count: result.vmCount }) }}
          </template>
          <template v-else>
            {{ result.error || t('vmware.discovery.failedToConnect') }}
          </template>
        </p>
      </div>
    </div>

    <button
      v-if="!result.success && onRetry"
      @click="onRetry(result.serverId)"
      class="px-3 py-1 text-xs font-medium text-danger-text bg-surface border border-danger-border rounded hover:bg-danger-surface transition-colors"
    >
      {{ t('common.retry') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Icon from '@/shared/components/Icon.vue';
import type { ServerDiscoveryResult } from '../types';

interface Props {
  result: ServerDiscoveryResult;
  onRetry?: (serverId: string) => void;
}

defineProps<Props>();
const { t } = useI18n();
</script>
