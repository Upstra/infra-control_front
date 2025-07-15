import { ref } from 'vue';
import { useVmwareDiscoveryStore } from '../store';
import { useToast } from 'vue-toast-notification';
import { useI18n } from 'vue-i18n';

export const useVmwareDiscovery = () => {
  const discoveryStore = useVmwareDiscoveryStore();
  const toast = useToast();
  const { t } = useI18n();

  const isStartingDiscovery = ref(false);
  const isRetrying = ref(false);

  /**
   * Start discovery for all VMware servers or specific ones
   */
  const startDiscovery = async (serverIds?: number[]) => {
    if (isStartingDiscovery.value) return;

    isStartingDiscovery.value = true;
    try {
      const response = await discoveryStore.startDiscovery(serverIds);
      toast.info(
        t('vmware.discovery.started', { count: response.serverCount }),
      );
      return response;
    } catch (error: any) {
      toast.error(error.message || t('vmware.discovery.startError'));
      throw error;
    } finally {
      isStartingDiscovery.value = false;
    }
  };

  /**
   * Retry discovery for failed servers
   */
  const retryFailedServers = async () => {
    if (isRetrying.value) return;

    const failedCount = discoveryStore.failedServersCount;
    if (failedCount === 0) {
      toast.warning(t('vmware.discovery.noFailedServers'));
      return;
    }

    isRetrying.value = true;
    try {
      await discoveryStore.retryFailedServers();
      toast.info(t('vmware.discovery.retryStarted', { count: failedCount }));
    } catch (error: any) {
      toast.error(error.message || t('vmware.discovery.retryError'));
      throw error;
    } finally {
      isRetrying.value = false;
    }
  };

  /**
   * Check and restore active discovery session
   */
  const checkActiveSession = async () => {
    try {
      const hasActive = await discoveryStore.checkActiveDiscovery();
      if (hasActive) {
        toast.info(t('vmware.discovery.sessionRestored'));
      }
      return hasActive;
    } catch (error: any) {
      console.error('Failed to check active session:', error);
      return false;
    }
  };

  /**
   * Cancel the current discovery
   */
  const cancelDiscovery = async () => {
    if (!discoveryStore.sessionId) return;

    try {
      await discoveryStore.cancelDiscovery();
      toast.success(t('vmware.discovery.cancelled'));
    } catch (error: any) {
      toast.error(error.message || t('vmware.discovery.cancelError'));
      throw error;
    }
  };

  return {
    // Store state
    discoveryStore,

    // Actions
    startDiscovery,
    retryFailedServers,
    checkActiveSession,
    cancelDiscovery,

    // Loading states
    isStartingDiscovery,
    isRetrying,
  };
};
