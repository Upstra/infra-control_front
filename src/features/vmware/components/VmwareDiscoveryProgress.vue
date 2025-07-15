<template>
  <div class="vmware-discovery-progress">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {{ t('vmware.discovery.title') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          {{ t('vmware.discovery.description') }}
        </p>
      </div>

      <DiscoveryProgressBar
        :status="discoveryStore.status"
        :progress-percentage="discoveryStore.progressPercentage"
        :current-server="discoveryStore.currentServer"
        class="mb-6"
      />

      <div v-if="discoveryStore.status === 'discovering'" class="mb-6">
        <div
          class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400"
        >
          <span>
            {{ t('vmware.discovery.serversProcessed') }}:
            {{ discoveryStore.serversProcessed }} /
            {{ discoveryStore.totalServers }}
          </span>
          <span v-if="discoveryStore.discoveredVms.length > 0">
            {{ t('vmware.discovery.totalVmsFound') }}:
            {{ discoveryStore.totalVmsDiscovered }}
          </span>
        </div>
      </div>

      <div v-if="discoveryStore.serverResults.length > 0" class="space-y-3">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {{ t('vmware.discovery.serverStatus') }}
        </h3>
        <DiscoveryServerStatus
          v-for="result in discoveryStore.serverResults"
          :key="result.serverId"
          :result="result"
          :on-retry="handleRetryServer"
        />
      </div>

      <div
        v-if="
          discoveryStore.status === 'completed' &&
          discoveryStore.discoveredVms.length > 0
        "
        class="mt-6"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          {{ t('vmware.discovery.discoveredVms') }}
        </h3>
        <div
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto"
        >
          <DiscoveredVmCard
            v-for="vm in discoveryStore.discoveredVms"
            :key="vm.moid"
            :vm="vm"
          />
        </div>
      </div>

      <div v-if="discoveryStore.error" class="mt-4">
        <div
          class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
        >
          <div class="flex">
            <Icon name="exclamation-triangle" class="h-5 w-5 text-red-400" />
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                {{ t('vmware.discovery.errorOccurred') }}
              </h3>
              <div class="mt-2 text-sm text-red-700 dark:text-red-300">
                {{ discoveryStore.error }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-between">
        <div>
          <button
            v-if="
              discoveryStore.failedServersCount > 0 &&
              discoveryStore.status === 'completed'
            "
            @click="handleRetryAllFailed"
            class="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <Icon name="arrow-path" class="inline-block w-4 h-4 mr-2" />
            {{
              t('vmware.discovery.retryFailedServers', {
                count: discoveryStore.failedServersCount,
              })
            }}
          </button>
        </div>

        <div class="flex space-x-3">
          <button
            v-if="discoveryStore.status === 'discovering'"
            @click="handleCancel"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            v-if="
              discoveryStore.status === 'completed' ||
              discoveryStore.status === 'error'
            "
            @click="handleContinue"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {{ t('common.continue') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVmwareDiscoveryStore } from '../store';
import DiscoveryProgressBar from './DiscoveryProgressBar.vue';
import DiscoveryServerStatus from './DiscoveryServerStatus.vue';
import DiscoveredVmCard from './DiscoveredVmCard.vue';
import Icon from '@/shared/components/Icon.vue';

interface Props {
  sessionId: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

const props = defineProps<Props>();
const { t } = useI18n();
const discoveryStore = useVmwareDiscoveryStore();

onMounted(() => {
  discoveryStore.connectToDiscovery(props.sessionId);
});

onUnmounted(() => {
  if (discoveryStore.isConnected) {
    discoveryStore.disconnectSocket();
  }
});

const handleContinue = () => {
  props.onComplete?.();
};

const handleCancel = () => {
  discoveryStore.disconnectSocket();
  props.onCancel?.();
};

const handleRetryServer = async (serverId: string) => {
  try {
    await discoveryStore.startDiscovery([parseInt(serverId)]);
  } catch (error) {
    console.error('Failed to retry server:', error);
  }
};

const handleRetryAllFailed = async () => {
  try {
    await discoveryStore.retryFailedServers();
  } catch (error) {
    console.error('Failed to retry failed servers:', error);
  }
};
</script>
