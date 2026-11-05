<template>
  <div class="vmware-discovery-progress">
    <div class="bg-surface rounded-lg shadow-lg p-6">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-text-strong mb-2">
          {{ t('vmware.discovery.title') }}
        </h2>
        <p class="text-text">
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
          class="flex items-center justify-between text-sm text-text"
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
        <h3 class="text-lg font-semibold text-text-strong mb-3">
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
        <h3 class="text-lg font-semibold text-text-strong mb-3">
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
          class="bg-danger-surface border border-danger-border rounded-lg p-4"
        >
          <div class="flex">
            <Icon name="exclamation-triangle" class="h-5 w-5 text-danger-text" />
            <div class="ml-3">
              <h3 class="text-sm font-medium text-danger-text">
                {{ t('vmware.discovery.errorOccurred') }}
              </h3>
              <div class="mt-2 text-sm text-danger-text">
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
            class="px-4 py-2 text-sm font-medium text-white bg-warning rounded-md hover:bg-warning focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warning"
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
            class="px-4 py-2 text-sm font-medium text-text bg-surface border border-border-control rounded-md hover:bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            v-if="
              discoveryStore.status === 'completed' ||
              discoveryStore.status === 'error'
            "
            @click="handleContinue"
            class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
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
