<template>
  <div
    :class="[
      'flex items-center justify-between p-3 rounded-lg',
      result.success
        ? 'bg-green-50 dark:bg-green-900/20'
        : 'bg-red-50 dark:bg-red-900/20',
    ]"
  >
    <div class="flex items-center space-x-3">
      <Icon
        :name="result.success ? 'check-circle' : 'x-circle'"
        :class="[
          'w-5 h-5',
          result.success
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400',
        ]"
      />
      <div>
        <h4 class="text-sm font-medium text-gray-900 dark:text-white">
          {{ result.serverName }}
        </h4>
        <p class="text-xs text-gray-600 dark:text-gray-400">
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
      class="px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
