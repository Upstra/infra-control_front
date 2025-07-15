<template>
  <div class="flex flex-col min-h-[70vh] px-4 py-10">
    <div class="mb-8 text-center">
      <h2
        class="text-2xl md:text-3xl font-bold text-neutral-darker dark:text-white tracking-tight"
      >
        {{ t('setup.vm_discovery.title') }}
      </h2>
      <p
        class="mt-2 text-base md:text-lg text-neutral-dark dark:text-neutral-300 max-w-lg mx-auto"
      >
        {{ t('setup.vm_discovery.description') }}
      </p>
    </div>

    <div class="max-w-4xl mx-auto w-full">
      <div v-if="isCheckingSession" class="text-center">
        <div class="flex items-center justify-center py-8">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"
          ></div>
          <span class="ml-3 text-gray-600 dark:text-gray-400">
            {{ t('setup.vm_discovery.checking_session') }}
          </span>
        </div>
      </div>

      <VmwareDiscoveryProgress
        v-else-if="discoverySessionId"
        :session-id="discoverySessionId"
        :on-complete="handleDiscoveryComplete"
        :on-cancel="handleDiscoveryCancel"
      />

      <div v-else class="text-center">
        <p class="text-gray-600 dark:text-gray-400">
          {{ t('setup.vm_discovery.no_session') }}
        </p>
        <button
          @click="skipDiscovery"
          class="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          {{ t('common.skip') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useSetupStore } from '../../store';
import { useVmwareDiscoveryStore } from '@/features/vmware/store';
import VmwareDiscoveryProgress from '@/features/vmware/components/VmwareDiscoveryProgress.vue';
import { SetupStep } from '../../types';

const { t } = useI18n();
const router = useRouter();
const setupStore = useSetupStore();
const vmwareStore = useVmwareDiscoveryStore();

const discoverySessionId = computed(() => setupStore.discoverySessionId);
const isCheckingSession = ref(false);

onMounted(async () => {
  isCheckingSession.value = true;
  const hasActiveSession = await vmwareStore.checkActiveDiscovery();
  isCheckingSession.value = false;

  if (hasActiveSession) {
    setupStore.discoverySessionId = vmwareStore.sessionId;
  } else if (!discoverySessionId.value) {
    console.warn('No discovery session ID found');
  }
});

const navigateToComplete = async () => {
  if (setupStore.setupStatus) {
    setupStore.setupStatus.currentStep = SetupStep.COMPLETE;
    setupStore.setupStatus.currentStepIndex = 7; // COMPLETE is at index 7
  }

  setupStore.saveCurrentStep(SetupStep.COMPLETE);

  await router.push('/setup/complete');
};

const handleDiscoveryComplete = async () => {
  setupStore.discoverySessionId = null;
  setupStore.vmwareDiscoveryEnabled = false;

  await navigateToComplete();
};

const handleDiscoveryCancel = async () => {
  setupStore.discoverySessionId = null;
  setupStore.vmwareDiscoveryEnabled = false;

  await navigateToComplete();
};

const skipDiscovery = async () => {
  await navigateToComplete();
};
</script>
