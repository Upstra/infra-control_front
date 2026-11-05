<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center"
    @click="closeDialog"
  >
    <div class="absolute inset-0 bg-black bg-opacity-50"></div>

    <div
      class="relative bg-surface rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
      @click.stop
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-text-strong">
          {{ t('setup.restart.title') }}
        </h3>
        <button
          @click="closeDialog"
          class="text-text-muted hover:text-text-muted transition-colors"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <div class="mb-6">
        <p class="text-text mb-4">
          {{ t('setup.restart.description') }}
        </p>

        <div
          class="bg-warning-surface border border-warning/40 rounded-lg p-4"
        >
          <div class="flex items-start space-x-3">
            <ExclamationTriangleIcon
              class="w-5 h-5 text-warning-text flex-shrink-0 mt-0.5"
            />
            <div>
              <p class="text-sm font-medium text-warning-text">
                {{ t('setup.restart.warning.title') }}
              </p>
              <p class="text-sm text-warning-text mt-1">
                {{ t('setup.restart.warning.description') }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end space-x-3">
        <button
          @click="closeDialog"
          class="px-4 py-2 text-sm font-medium text-text bg-surface border border-border-control rounded-lg hover:bg-surface-sunken transition-colors"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          @click="confirmRestart"
          class="px-4 py-2 text-sm font-medium text-white bg-danger-solid hover:bg-danger-solid rounded-lg transition-colors"
        >
          {{ t('setup.restart.confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline';
import { useI18n } from 'vue-i18n';
import { useSetupStore } from '../../store';

const { t } = useI18n();
const setupStore = useSetupStore();

interface Props {
  isOpen: boolean;
}

interface Emits {
  (event: 'close'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const closeDialog = () => {
  emit('close');
};

const confirmRestart = async () => {
  await setupStore.restartSetup();
  closeDialog();
};
</script>
